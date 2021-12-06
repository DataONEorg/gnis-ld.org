
const app_config = require('../../config.app.js');

addJuneau = function() {
  tab = yasgui.addTab(
    true, // set as active tab
    { requestConfig: {"endpoint": 'https:\/\/'+app_config.data_host+'/sparql'}, name: "Juneau, Alaska" }
  );
  tab.setQuery(`PREFIX gnis: <https:\/\/`+app_config.data_host+`\/lod\/gnis\/ontology\/>
PREFIX gnisf-alias: <https:\/\/`+app_config.data_host+`\/lod/gnis\/feature-alias\/>
PREFIX rdfs: <http:\/\/www.w3.org\/2000\/01\/rdf-schema#>
PREFIX rdf: <http:\/\/www.w3.org\/1999\/02\/22-rdf-syntax-ns#>
SELECT ?label ?nodeType ?description where {
  ?s gnis:county gnisf-alias:Alaska.Juneau .
  ?s rdfs:label ?label .
  ?s rdf:type ?nodeType .
  ?s gnis:description ?description .
}
`);
};

addElevation = function() {
  tab = yasgui.addTab(
    true, // set as active tab
    { requestConfig: {"endpoint": 'https:\/\/'+app_config.data_host+'/sparql'}, name: "High Elevation" }
  );
  tab.setQuery(`PREFIX gnis: <https:\/\/`+app_config.data_host+`\/lod\/gnis\/ontology\/>
PREFIX gnisf-alias: <https:\/\/`+app_config.data_host+`\/lod/gnis\/feature-alias\/>
PREFIX rdfs: <http:\/\/www.w3.org\/2000\/01\/rdf-schema#>
PREFIX rdf: <http:\/\/www.w3.org\/1999\/02\/22-rdf-syntax-ns#>
PREFIX qudt: <http:\/\/qudt.org\/schema\/qudt\/>
SELECT ?label ?nodeType ?description ?elevationValue where {
  ?s rdf:type ?nodeType .
 ?s gnis:description ?description .
  ?s rdfs:label ?label .
 ?s gnis:elevation ?elevation .
  ?elevation qudt:numericValue ?elevationValue .
 FILTER(?elevationValue > 10000)
}
`);
};

addDam = function() {
  tab = yasgui.addTab(
    true, // set as active tab
    { requestConfig: {"endpoint": 'https:\/\/'+app_config.data_host+'/sparql'}, name: "High Elevation" }
  );
  tab.setQuery(`PREFIX gnis: <https:\/\/`+app_config.data_host+`\/lod\/gnis\/ontology\/>
PREFIX gnisf-alias: <https:\/\/`+app_config.data_host+`\/lod/gnis\/feature-alias\/>
PREFIX rdfs: <http:\/\/www.w3.org\/2000\/01\/rdf-schema#>
PREFIX rdf: <http:\/\/www.w3.org\/1999\/02\/22-rdf-syntax-ns#>
PREFIX qudt: <http:\/\/qudt.org\/schema\/qudt\/>
PREFIX onto:<http://www.ontotext.com/> 
SELECT ?dam {
   ?dam rdf:type <https:\/\/`+app_config.data_host+`/lod/cegis/ontology/Dam> . 
}
`);
};