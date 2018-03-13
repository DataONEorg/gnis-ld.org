const path = require('path');
const url = require('url');

// third-party modules
const express = require('express'); require('express-negotiate');
const proxy = require('http-proxy-middleware');
const jsonld = require('jsonld');
const h_argv = require('minimist')(process.argv.slice(2));
const pg = require('pg');
const request = require('request');

// local classes / configs
const app_config = require('../../config.app.js');

const N_PORT = h_argv.p || h_argv.port || 80;

const P_BASE = app_config.data_uri;
const S_DATA_HOST = app_config.data_host;
const S_DATA_PATH = app_config.data_path;
const P_BASE_GNIS = `${P_BASE}/gnis`;


const PD_ROOT = path.resolve(__dirname, '../../');

const PD_LIB = path.join(PD_ROOT, 'lib');
const PD_LIB_WEBAPP = path.join(PD_LIB, 'webapp');
const PD_RESOURCES = path.join(PD_LIB_WEBAPP, '_resources');

const PD_DIST = path.join(PD_ROOT, 'dist');
const PD_DIST_WEBAPP = path.join(PD_DIST, 'webapp');


const P_ENDPOINT = app_config.sparql_endpoint;
const D_URL_ENDPOINT = new url.URL(P_ENDPOINT);

const S_PREFIXES = `
	prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
	prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
	prefix xsd: <http://www.w3.org/2001/XMLSchema#>
	prefix geo: <http://www.opengis.net/ont/geosparql#>
	prefix gnis: <${P_BASE_GNIS}/ontology/>
	prefix gnisf: <${P_BASE_GNIS}/feature/>
	prefix gnisp: <${P_BASE_GNIS}/place/>
`;

const _404 = (d_res) => {
	d_res.status(404).end('No such geometry');
};

// submit sparql query via HTTP
const sparql_query = (s_accept, s_query, fk_query) => {
	request.post(P_ENDPOINT, {
		headers: {
			accept: s_accept,
			'content-type': 'application/sparql-query;charset=UTF-8',
		},
		body: S_PREFIXES+'\n'+s_query,
	}, fk_query);
};

const k_app = express();

// sparql
k_app.use(proxy('/sparql/select', {
	target: P_ENDPOINT,
}));

// views
k_app.set('views', path.join(PD_LIB_WEBAPP, '_layouts'));
k_app.set('view engine', 'pug');

// static routing
k_app.use('/script', express.static(path.join(PD_DIST_WEBAPP, '_scripts')));
k_app.use('/style', express.static(path.join(PD_DIST_WEBAPP, '_styles')));
k_app.use('/resource', express.static(path.join(PD_LIB_WEBAPP, '_resources')));
k_app.use('/font', express.static(path.join(PD_ROOT, 'node_modules/font-awesome/fonts')));

// index
k_app.get([
	'/',
], (d_req, d_res) => {
	d_res.type('text/html');
	d_res.render('index');
});

// landing page
k_app.get([
	'/lod/',
], (d_req, d_res) => {
	d_res.redirect('/');
});

// dereferencing a geometry
const y_pool = new pg.Pool();
k_app.get('/lod/geometry/*', (d_req, d_res) => {
	let p_guri = P_BASE+d_req.url.substr('/lod'.length);

	// fetch pg client from pool
	y_pool.connect((e_connect, y_client, fk_client) => {
		if(e_connect) {
			console.error(e_connect);
			return d_res.status(500).send('failed to connect to database');
		}

		// CORS header
		d_res.set('Access-Control-Allow-Origin', '*');

		// select and send a geometry from postgres
		const select_and_send_geometry = (s_transform, s_media_type) => {
			d_res.type(s_media_type);
			y_client.query(`
				select ${s_transform}(gvalue) as format from nodes
				where svalue=$1
			`, [p_guri], (e_query, h_result) => {
				if(e_query) {
					console.error(e_query);
					d_res.status(500).send('encountered database error');
					return;
				}
				let a_rows = h_result.rows;
				if(!a_rows.length) return _404(d_res);
				d_res.send(a_rows[0].format);
				fk_client();
			});
		};

		// content negotiation
		d_req.negotiate({
			'text/html': () => {
				d_res.type('text/html');
				d_res.render('geometry');
			},

			// Well-Known Text
			'text/plain': () => select_and_send_geometry('ST_AsText', 'text/plain'),

			// GeoJSON
			'application/json': () => select_and_send_geometry('ST_AsGeoJSON', 'application/json'),

			// actual GeoJSON
			'application/vnd.geo+json': () => select_and_send_geometry('ST_AsGeoJSON', 'application/vnd.geo+json'),

			// GML
			'application/gml+xml': () => select_and_send_geometry('ST_AsGML', 'application/gml+xml'),

			// Well-Known Binary
			'application/octet-stream': () => select_and_send_geometry('ST_AsEWKB', 'application/octet-stream'),
		});
	});
});


// request for the page about the resource
k_app.get([
	'/lod/page/*',
], (d_req, d_res) => {
	d_res.redirect(`http://phuzzy.link/browse/${D_URL_ENDPOINT.host}${D_URL_ENDPOINT.pathname}#http://${S_DATA_HOST}${d_req.url}`);
});


// request for usgs / gnis ontology
k_app.get([
	'/lod/usgs/ontology',
	'/lod/gnis/ontology',
], (d_req, d_res) => {
	d_res.sendFile(path.join(PD_RESOURCES, 'usgs-ld.ttl'));
});

// // request for nhd ontology
// k_app.get([
// 	'/lod/nhd/ontology/:type',
// ], (d_req, d_res) => {
// 	d_res.redirect('/lod/page/nhd/ontology/'+d_req.params.type);
// });

const negotiate_feature = (d_req, d_res, f_next) => {
	let {
		dataset: s_dataset,
		group: s_group,
		thing: s_thing,
	} = d_req.params;

	// redirection
	let p_redirect = `/lod/page/${s_dataset}/${s_group}/${s_thing}`;

	// entity uri
	let p_entity = P_BASE.replace(/\/[^\/]*$/, '')+d_req.url;

	// HTTP head request
	let b_head_only = 'HEAD' === d_req.method;

	// non-GET
	if(!b_head_only && 'GET' !== d_req.method) {
		return f_next();
	}

	// default is to redirect to page
	let f_redirect = () => {
		d_res.redirect(p_redirect);
	};

	// application/rdf+xml
	let f_rdf_xml = () => {
		sparql_query('application/rdf+xml', `describe <${p_entity}>`, (e_query, d_sparql_res, s_res_body) => {
			// response mime type
			d_res.type('application/rdf+xml');

			// response status code
			d_res.statusCode = e_query? 500: d_sparql_res.statusCode;

			// head only; don't send body
			if(b_head_only) return d_res.end();

			// otherwise; send body
			d_res.send(s_res_body);
		});
	};

	// content negotiation
	d_req.negotiate({
		'application/rdf+xml': f_rdf_xml,

		'text/turtle': () => {
			sparql_query('application/json', `describe <${p_entity}>`, (e_query, d_sparql_res, s_res_body) => {
				// response mime type
				d_res.type('text/turtle');

				// response status code
				d_res.statusCode = e_query? 500: d_sparql_res.statusCode;

				// head only; don't send body
				if(b_head_only) return d_res.end();

				// otherwise; send body
				jsonld.toRDF(JSON.parse(s_res_body), {format:'application/nquads'}, (e_parse, s_nquads) => {
					d_res.send(s_nquads);
				});
			});
		},

		'application/nquads': () => {
			sparql_query('application/json', `describe <${p_entity}>`, (e_query, d_sparql_res, s_res_body) => {
				// response mime type
				d_res.type('application/nquads');

				// response status code
				d_res.statusCode = e_query? 500: d_sparql_res.statusCode;

				// head only; don't send body
				if(b_head_only) return d_res.end();

				// otherwise; send body
				jsonld.toRDF(JSON.parse(s_res_body), {format:'application/nquads'}, (e_parse, s_nquads) => {
					d_res.send(s_nquads);
				});
			});
		},

		html: f_redirect,
		default: f_rdf_xml,
	});
};

// request for thing
k_app.use([
	'/lod/:dataset/:group/:thing',
], negotiate_feature);

// bind to port
k_app.listen(N_PORT, () => {
	console.log(`running on port ${N_PORT}`);
});
