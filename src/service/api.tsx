import { ArgGisJson } from '../interfaces/ArgGis';
import { DbPediaJson } from '../interfaces/dbpediaJson';
import { GeonameData, GeonamesSearch } from '../interfaces/geonamesSearch';
import { GeoPortOstSparQl } from '../interfaces/geoport';
import { GettyJson } from '../interfaces/gettyJson';
import { GndJson } from '../interfaces/GndJson';
import { Maps } from '../interfaces/maps';
import { OVERPASS } from '../interfaces/overpass';
import { riconciJson, WbSearch } from '../interfaces/wbSearch';
import { WikidataCard, WikidataCity, WikidataExtra, WikidataPopulation } from '../interfaces/wikidataCityData';
import { GOVKEY } from '../types/govkey';
import { Lang } from '../types/lang';
import { LngLat, WGS84 } from '../util/WGS84';

export class API {

private static readonly BASEURL_LOBID = 'https://lobid.org/gnd/search?format=json&q=';
private static readonly BASEURL_WIKIDATA_SPARQL = 'https://query.wikidata.org/sparql?format=json&query=';
private static readonly BASEURL_GETTY_SPARQL = 'http://vocab.getty.edu/sparql.json?query=';
private static readonly BASEURL_GEONAMES = 'http://api.geonames.org/';
private static readonly USER = "quenouil";

/*
https://services2.arcgis.com/jUpNdisbWqRpMo35/arcgis/rest/services/PLZ_Gebiete/FeatureServer/0/query?f=json&where=1%3D1&outFields=*&returnGeometry=false
https://opendata-esri-de.opendata.arcgis.com/datasets/esri-de-content::postleitzahlengebiete-osm/explore?location=50.978073%2C13.325856%2C8.00&showTable=true

/* Geonames
http://api.geonames.org/searchJSON?q=leipzig&name_startsWith=leipzig&maxRows=50&country=&featureClass=P&continentCode=&fuzzy=0.6&username=quenouil
http://api.geonames.org/childrenJSON?geonameId=2879139&lang=de&username=quenouil
https://www.geonames.org/getJSON?id=2879139&style=gui&lang=de&username=quenouil
http://overpass-api.de/api/interpreter?data=[out:json];relation["de:amtlicher_gemeindeschluessel"="14713000"];(._;>;);out;
*/
static readonly getOverpass = async (ags: string): Promise<OVERPASS> => {
  const url = `http://overpass-api.de/api/interpreter?data=[out:json];relation["de:amtlicher_gemeindeschluessel"="${ags}"];(._;>;);out;`;
  const response = await fetch(url)
  return await response.json();
}

static readonly getOverpassLayer = async (wdId: string, [lon, lat]: LngLat): Promise<OVERPASS> => {
  const url = `http://overpass-api.de/api/interpreter?data=[out:json];
  is_in(${lat},${lon});
  (rel[boundary=administrative][wikidata=${wdId}](pivot);>;);out qt;`;
  const response = await fetch(url)
  return await response.json();
}

// https://opendata-esri-de.opendata.arcgis.com/datasets/esri-de-content::postleitzahlengebiete-osm/explore?location=50.954647%2C13.325856%2C8.00&showTable=true
// https://opendata-esri-de.opendata.arcgis.com/datasets/esri-de-content::postleitzahlengebiete-osm/about
static readonly loadAgsPlz = async (): Promise<ArgGisJson> => {
  const url = `https://services2.arcgis.com/jUpNdisbWqRpMo35/arcgis/rest/services/PLZ_Gebiete/FeatureServer/0/query?f=json&where=1%3D1&outFields=plz,ags,einwohner&returnGeometry=false`;
  const response = await fetch(url)
  return await response.json();
}

static readonly testtest = async (): Promise<{}> => {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&osm_id=62649&osm_type=R&polygon_geojson=1`;
  const response = await fetch(url)
  return await response.json();
}

static readonly getGeonamesSearch = async (search: string, lang: Lang, option: string[]): Promise<GeonamesSearch> => {
  const de = option?.includes('DE') ? 'de' : '';
  const eu = option?.includes('EU') ? 'eu' : '';
  const url = `${API.BASEURL_GEONAMES}searchJSON?name=${search}*&name_startsWith=${search}&lang=${lang}&isNameRequired=true&maxRows=50&country=${de}&featureClass=P&continentCode=${eu}&fuzzy=0.6&username=${API.USER}`;
  const response = await fetch(url)
  return await response.json();
}

static readonly getGeonamesEntity = async (id: string, lang: Lang): Promise<GeonameData> => {
  const url = `${API.BASEURL_GEONAMES}getJSON?id=${id}&style=gui&lang=${lang}&username=${API.USER}`;
  const response = await fetch(url)
  return await response.json();
}

static readonly getGeonamesChildren = async (id: string, lang: Lang): Promise<GeonamesSearch> => {
  const url = `${API.BASEURL_GEONAMES}childrenJSON?geonameId=${id}&lang=${lang}&username=${API.USER}`;
  const response = await fetch(url)
  return await response.json();
}

static readonly getSlubMaps = async (lngLat: LngLat, range: number): Promise<Maps> => {
  const radius = 1 + range * 1.41;
  const polygon = WGS84.bboxToPolynom(lngLat, radius);
  const body = `{"query":{"filtered":{"filter":{"bool":{"must":[{"geo_shape":{"geometry":{"shape":{"type":"polygon","coordinates":[${JSON.stringify(polygon)}]}}}}]}}}}}`;
  const url = `https://kartenforum.slub-dresden.de/spatialdocuments/_search?from=0&size=100`;
  const response = await fetch(url, {
    body: body,
    headers: {'Content-Type': 'multipart/form-data'},
    method: 'post',
  });
  return await response.json();
}

static readonly getGeoPortOstTopo100000 = async (): Promise<GeoPortOstSparQl> => {
  const sparql =`
PREFIX geo: <http://www.opengis.net/ont/geosparql#>
PREFIX el: <http://purl.org/dc/elements/1.1/>
PREFIX area:<http://www.geographicknowledge.de/vocab/maps#>
PREFIX terms: <http://purl.org/dc/terms/>
PREFIX rd: <http://rdvocab.info/Elements/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
SELECT ?url ?title ?id ?year ?typ ?scale ?gnd ?thumb ?area (group_concat(?sub; separator="; ") as ?keywords) 
WHERE {
	?url el:title ?title .
    ?url terms:identifier ?id .
  	optional { ?url el:issued ?year}.
    ?url el:type ?typ .
#  	FILTER( REGEX( lcase(str(?typ)), 'topografische karte' ) ) .
    ?url rd:dimensionsOfMapEtc ?scale .
  	FILTER( strlen(str(?scale)) < 7 ) .
    optional { ?url el:spatial ?gnd }.
    optional { ?url terms:spatial ?sub }.
    ?url foaf:depiction ?thumb .
  	?url area:mapsArea/geo:asWKT ?area .
} GROUP BY ?url ?title ?id ?year ?typ ?scale ?gnd ?thumb ?area
  `;
  const url = `http://geoportost.ios-regensburg.de:3030/geoportost/sparql?query=${encodeURIComponent(sparql)}`;
  const response = await fetch(url);
  return await response.json();
}

// ############### GND ###############

static readonly gndLookup = async (search: string): Promise<GndJson> => {
  const name = `preferredName:${search}*`;
  const filter = '&filter=type:TerritorialCorporateBodyOrAdministrativeUnit';
  const url = `${API.BASEURL_LOBID}${name}${filter}&size=500`;
  const response = await fetch(url)
  return await response.json();
}

static readonly gndEntryById = async (lobidId: string): Promise<GndJson> => {
  const id = `gndIdentifier:${lobidId}`;
  const filter = '&filter=type:TerritorialCorporateBodyOrAdministrativeUnit';
  const url = `${API.BASEURL_LOBID}${id}${filter}&size=1`;
  const response = await fetch(url)
  return await response.json();
}

// ############### GOV ###############

static readonly govSearchIDWithKey = async (key: GOVKEY, idRef: String) => {
  const body = `system=${key}&ref=${idRef}`;
  const url = `http://gov.genealogy.net/search/externalRef`;
  return await fetch(url, {
    body: body,
    headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
    method: 'post',
  });
}

static readonly govTestId = async (govId: string) => {
  const url = `http://gov.genealogy.net/item/show/${govId}`;
  return await fetch(url, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Accept': '*/*'
    },
    method: 'get',
  });
} 

static readonly govEntryById = async (govId: string): Promise<Document> => {
  const url = `http://gov.genealogy.net/semanticWeb/about/${govId}`;
  const parser = new DOMParser();
  return await fetch(url)
    .then(response => response.text())
    .then(data => parser.parseFromString(data, 'application/xml'))
}

// ############### WIKIDATA ###############
// Alternative https://wikidata.reconci.link/en/api?query={"query":"Leipzig","type":"Q56061"}
static readonly reconciLookup = async (search: string, lang: Lang, limit: number): Promise<riconciJson> => {
  const BASEURL_RECONCI = `https://wikidata.reconci.link/${lang}/api?query=`;
  const json = {query: search, type: "Q486972"};
  const url = `${BASEURL_RECONCI}${JSON.stringify(json)}`;
  const response = await fetch(url)
  return await response.json();
}

static readonly wdLookup = async (search: string, lang: Lang, limit: number): Promise<WbSearch> => {
  const BASEURL_WIKIDATA = 'https://www.wikidata.org/w/api.php?action=';
  const url = `${BASEURL_WIKIDATA}wbsearchentities&search=${search}&origin=*&format=json&language=${lang}&uselang=${lang}&limit=${limit}`;
  const response = await fetch(url)
  return await response.json();
}

static readonly wdCityData = async (id: string, lang: Lang): Promise<WikidataCity> => {
  const SELECT = `SELECT ?property ?x ?propertyLabel ?ab ?bis ?lid ?cityLabel WHERE {
    VALUES ?city {wd:${id}}
    { 
      VALUES ?x {'ist'}
      ?city p:P31 ?_.
      ?_ ps:P31 ?property.
      optional {?_ pq:P580 ?ab.}
      optional {?_ pq:P582 ?bis.}
    } UNION {
      VALUES ?x {'administriert durch'}
      ?city p:P1376 ?_.
      optional{ ?_ ps:P1376 ?property.}  
      optional{ ?_ pq:P580 ?ab.}
      optional{ ?_ pq:P582 ?bis.}
    } UNION {
      VALUES ?x {'gehört zu (Staat, Fürstentum, Reich)'}
      ?city p:P17 ?_.
      optional{ ?_ ps:P17 ?property.}  
      optional{ ?_ pq:P580 ?ab.}
      optional{ ?_ pq:P582 ?bis.}
    } UNION {
      VALUES ?x {'wichtige Ereignisse'}
      ?city p:P793 ?_.
      optional{ ?_ ps:P793 ?property.}  
      optional{ ?_ pq:P585 ?ab.}
    } UNION {
      VALUES ?x {'erstmalig schriftlich aufgezeichnet'}
      ?city p:P1249 ?_.
      optional{ ?_ ps:P1249 ?property.}  
      optional{ ?_ pq:P585 ?ab.}
    } UNION {
      VALUES ?x {'Teil der Verwaltungseinheit'}
      ?city p:P131 ?_.
      ?_ ps:P131 ?property.
      optional {?_ pq:P580 ?ab.}
      optional {?_ pq:P582 ?bis.}
    } UNION {
      VALUES ?x {'Originalname'}
      ?city p:P1448 ?_.
      ?_ ps:P1448 ?property.
      optional {?_ pq:P580 ?ab.}
      optional {?_ pq:P582 ?bis.}
    } UNION {
      VALUES ?x {'gegründet'}
      optional{
        ?city wdt:P571 ?ab.
        ?city wdt:P1705 ?property.
      }
    } UNION {
      VALUES ?x {'historische Region'}
      optional{ ?city wdt:P6885 ?property.}
    } UNION {
      VALUES ?x {'grenzt an'}
      optional{ ?city wdt:P47 ?property.}
    } UNION {
      VALUES ?x {'benannt nach'}
      optional{ ?city wdt:P138 ?property.}
    } UNION {
      VALUES ?x {'wird auch genannt'}
      optional{ ?city wdt:P1449 ?property.}
    } UNION {
      VALUES ?x {'Geonames'}
      optional{ ?city wdt:P1566 ?lid.}
    } UNION {
      VALUES ?x {'AGS'}
      optional{ ?city wdt:P439 ?lid.}
    } UNION {
      VALUES ?x {'getty'}
      optional{ ?city wdt:P1667 ?lid.}
    } UNION {
      VALUES ?x {'NUTS'}
      optional{ ?city wdt:P605 ?lid.}
    } UNION {
      VALUES ?x {'OSMrelation'}
      optional{ ?city wdt:P402 ?lid.}
    } UNION {
      VALUES ?x {'topostext'}
      optional{ ?city wdt:P8068 ?lid.}
    } UNION {
      VALUES ?x {'GOV'}
      optional{ ?city wdt:P2503 ?lid.}
    } UNION {
      VALUES ?x {'GND'}
      optional{ ?city wdt:P227 ?lid.}
    } UNION {
      VALUES ?x {'SIMC'}
      optional{ ?city wdt:P4046 ?lid.}
    } union {
      VALUES ?x {'archINFORM'}
      optional{ ?city wdt:P5573 ?lid.}
    } UNION {
      VALUES ?x {'LAU'}
      optional{ ?city wdt:P782 ?lid.}
    } UNION {
      VALUES ?x {'HDS_ID'}
      optional{ ?city wdt:P902 ?lid.}
    }
    SERVICE wikibase:label { bd:serviceParam wikibase:language '${lang},en'. }
  }`;
  const url = `${API.BASEURL_WIKIDATA_SPARQL}${SELECT}`;
  const response = await fetch(url)
  return await response.json();
}

static readonly wdPopulation = async (id: string): Promise<WikidataPopulation> => {
  const SELECT = `SELECT ?population ?date WHERE {
    VALUES ?city {wd:${id}}
    ?city p:P1082 ?_.
    ?_ ps:P1082 ?population.
    optional {?_ pq:P585 ?date.}
  }
  ORDER BY DESC(?date)`;
  const url = `${API.BASEURL_WIKIDATA_SPARQL}${SELECT}`;
  const response = await fetch(url)
  return await response.json();
}

static readonly wdExtra = async (id: string, lang: Lang): Promise<WikidataExtra> => {
  const SELECT = `
SELECT * WHERE {
  {SELECT ?audioLabel 
    WHERE { ?city wdt:P279* wd:${id}. OPTIONAL { ?city wdt:P443 ?audio } 
    SERVICE wikibase:label { bd:serviceParam wikibase:language "${lang},en". }
    } LIMIT 1}
  OPTIONAL
  {SELECT (group_concat(?timeLabel; separator="; ") as ?time) (group_concat(?timenameLabel; separator="; ") as ?timename) { 
    SELECT ?dummy ?timeLabel ?timenameLabel  WHERE { 
      ?city wdt:P279* wd:${id}. OPTIONAL { ?city p:P421 ?_. ?_ ps:P421 ?time. ?_ pq:P1264 ?timename. }       
      OPTIONAL { ?city wdt:P204777775 ?dummy }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "${lang},en". }
    }
  } group by ?dummy}
  OPTIONAL
  {SELECT ?ort ?area ?lat ?lon ?logoLabel ?imgLabel ?mapLabel ?flagLabel ?armsLabel ?sealLabel ?height ?mapDetailLabel ?mapLocationLabel WHERE {
    ?city wdt:P279* wd:${id}.
    OPTIONAL { ?city wdt:P2046 ?area }
    OPTIONAL { ?city p:P625/psv:P625 ?coord. ?coord wikibase:geoLatitude ?lat. ?coord wikibase:geoLongitude ?lon. }
    OPTIONAL { ?city wdt:P2044 ?height }
    OPTIONAL { ?city wdt:P154 ?logo }
    OPTIONAL { ?city wdt:P18 ?img }
    OPTIONAL { ?city wdt:P242 ?map }
    OPTIONAL { ?city wdt:P1621 ?mapDetail }
    OPTIONAL { ?city wdt:P1943 ?mapLocation }
    OPTIONAL { ?city wdt:P41 ?flag }
    OPTIONAL { ?city wdt:P94 ?arms }
    OPTIONAL { ?city wdt:P158 ?seal }
    OPTIONAL { ?city rdfs:label ?ort
               FILTER (LANG(?ort) = "de")  
    }
    SERVICE wikibase:label { bd:serviceParam wikibase:language "${lang},en". }
  } }
}`;

  const url = `${API.BASEURL_WIKIDATA_SPARQL}${SELECT}`;
  const response = await fetch(url)
  return await response.json();
}

// Q23413 Burg
// Q839954 Archälogische Stätte
// Q16970 Kirchen
// Q178561 Schlacht
static readonly wdCard = async (lang: Lang, lngLat: LngLat, radius: number, obj: string): Promise<WikidataCard> => {
  const SELECT = `
  SELECT distinct 
  ?ort ?ortLabel ?ortDescription ?ab
  (SAMPLE(?lat) AS ?lat) (SAMPLE(?lon) AS ?lon) (SAMPLE(?img) AS ?imgLabel) (SAMPLE(?distNum) AS ?distNum) (SAMPLE(?subLabel) AS ?subLabel) (SAMPLE(?subDescription) AS ?subDescription)
  WHERE {
    SERVICE wikibase:around {
      ?ort wdt:P625 ?location .
      bd:serviceParam wikibase:center "Point(${lngLat[0]} ${lngLat[1]})"^^geo:wktLiteral .
      bd:serviceParam wikibase:radius "${radius}" .
    }
    wd:${obj} ^wdt:P279*/^wdt:P31 ?ort .
    OPTIONAL{ ?ort wdt:P585 ?ab . }
    OPTIONAL{ ?ort wdt:P31 ?sub .
      ?sub rdfs:label ?subLabel .
       FILTER (LANG(?subLabel) = "${lang}")
      ?sub schema:description ?subDescription .
       FILTER (LANG(?subDescription) = "${lang}")
    }
    OPTIONAL{ ?ort wdt:P18 ?img .}
    ?ort wdt:P625 ?coord .
    ?ort p:P625/psv:P625 ?point .
    ?point wikibase:geoLatitude ?lat .
    ?point wikibase:geoLongitude ?lon .
    BIND(geof:distance('Point(${lngLat[0]} ${lngLat[1]})', ?coord) AS ?distNum).
    SERVICE wikibase:label { bd:serviceParam wikibase:language "${lang},en" . }
  } GROUP BY ?ort ?ortLabel ?ortDescription ?ab
  ORDER BY ?distNum LIMIT 20`;

  const url = `${API.BASEURL_WIKIDATA_SPARQL}${SELECT}`;
  const response = await fetch(url)
  return await response.json();
}




static readonly getGettyNoteAndNames = async (id: string): Promise<GettyJson> => {
  const SELECT = `select ?lab ?historic ?start ?end ?comment ?ScopeNote {
    values ?s {tgn:${id}}
    {
    values ?pred {xl:prefLabel xl:altLabel}
    ?s ?pred ?l.
    ?l xl:literalForm ?lab.
    optional {?l gvp:displayOrder ?ord}
    optional {?l gvp:historicFlag [skos:prefLabel ?historic]}
    optional {?l gvp:estStart ?start}
    optional {?l gvp:estEnd ?end}
    optional {?l rdfs:comment ?comment}
    } UNION {
    optional {?s skos:scopeNote [dct:language gvp_lang:en; rdf:value ?ScopeNote]}
    }
  } order by ?ord`;
  const url = `${API.BASEURL_GETTY_SPARQL}${SELECT}`;
  const response = await fetch(url)
  return await response.json();
}
static readonly getGettyPlaceTypes = async (id: string): Promise<GettyJson> => {
  const SELECT = `SELECT ?start ?end ?comment ?object ?objectID {
    ?statement rdf:subject tgn:${id};
                  rdf:predicate ?rel;
    OPTIONAL {?statement gvp:estStart ?start}.
    OPTIONAL {?statement gvp:estEnd ?end}.
    OPTIONAL {?statement rdfs:comment ?comment}.
    OPTIONAL {?statement gvp:historicFlag ?hist}.
    OPTIONAL {?statement rdf:object ?objectID.
              ?objectID rdfs:label ?object
              FILTER langMatches(lang(?object), "en")
    } 
  }`;
  const url = `${API.BASEURL_GETTY_SPARQL}${SELECT}`;
  const response = await fetch(url)
  return await response.json();
}  


static readonly getDbPedia = async (ags: string): Promise<DbPediaJson> => {
  const BASEURL_DBPEDIA_SPARQL = 'https://dbpedia.org/sparql?format=json&query=';
  const SELECT = `SELECT DISTINCT ?info
  WHERE {
  {
    ?_ dbp:gemeindeschlüssel ${ags} . 
    ?_ dbo:abstract ?info .
  FILTER (LANG(?info) = 'de') . 
  } union {
    ?_ dbp:gemeindeschlüssel ${ags} . 
    ?_ dbo:abstract ?info .
  FILTER (LANG(?info) = 'en') . 
  }
  }`;
  const url = `${BASEURL_DBPEDIA_SPARQL}${SELECT}`;
  const response = await fetch(url)
  return await response.json();
}  

}