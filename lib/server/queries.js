
addTahoe = function() {
  tab = yasgui.addTab(
    true, // set as active tab
    { ...Yasgui.Tab.getDefaults(), name: "Lake Tahoe" }
  );
  tab.setQuery(`  PREFIX rdf: <http:\/\/www.w3.org\/1999\/02\/22-rdf-syntax-ns#>
  PREFIX rdfs: <http:\/\/www.w3.org\/2000\/01\/rdf-schema#>
  select * where {?s ?p ?o}
  `);
};

addLakesCalifornia = function() {
  tab = yasgui.addTab(
    true, // set as active tab
    { ...Yasgui.Tab.getDefaults(), name: "California Lakes" }
  );
  tab.setQuery(`  PREFIX rdf: <http:\/\/www.w3.org\/1999\/02\/22-rdf-syntax-ns#>
  PREFIX rdfs: <http:\/\/www.w3.org\/2000\/01\/rdf-schema#>
  select * where {?s ?p ?o}
  `);
};

addStreamsLakes = function() {
  tab = yasgui.addTab(
    true, // set as active tab
    { ...Yasgui.Tab.getDefaults(), name: "Streams & Lakes" }
  );
  tab.setQuery(`  PREFIX rdf: <http:\/\/www.w3.org\/1999\/02\/22-rdf-syntax-ns#>
  PREFIX rdfs: <http:\/\/www.w3.org\/2000\/01\/rdf-schema#>
  select * where {?s ?p ?o}
  `);
};

addJuneau = function() {
  tab = yasgui.addTab(
    true, // set as active tab
    { requestConfig: {"endpoint": "google.com"}, name: "Juneau, Alaska" }
  );
  tab.setQuery(`PREFIX gnis: <https:\/\/gnis-ld.org\/lod\/gnis\/ontology\/>
  PREFIX gnisf-alias: <https:\/\/gnis-ld.org\/lod/gnis\/feature-alias\/>
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
    { ...Yasgui.Tab.getDefaults(), name: "High Elevation" }
  );
  tab.setQuery(`  PREFIX gnis: <https:\/\/gnis-ld.org\/lod\/gnis\/ontology\/>
  PREFIX gnisf-alias: <https:\/\/gnis-ld.org\/lod/gnis\/feature-alias\/>
  PREFIX rdfs: <http:\/\/www.w3.org\/2000\/01\/rdf-schema#>
  PREFIX rdf: <http:\/\/www.w3.org\/1999\/02\/22-rdf-syntax-ns#>
  PREFIX qudt: <http:\/\/qudt.org\/schema\/qudt\/>
  SELECT ?label ?nodeType ?description ?elevationValue where {
   ?s gnis:county ?country .
   ?s rdfs:label ?label .
   ?s rdf:type ?nodeType .
   ?s gnis:description ?description .
   ?s gnis:elevation ?elevation .
   ?elevation qudt:numericValue ?elevationValue .
   FILTER(?elevationValue > 10000)
  `);
};
