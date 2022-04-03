import { DbPediaJson } from '../interfaces/dbpediaJson';
import { GeonameById, GeonamesSearch } from '../interfaces/geonamesSearch';
import { AllOrigins } from '../interfaces/geoport';
import { GettyJson } from '../interfaces/gettyJson';
import { LobidJson } from '../interfaces/lobidJson';
import { Maps } from '../interfaces/maps';
import { OVERPASS } from '../interfaces/overpass';
import { WbSearch } from '../interfaces/wbSearch';
import { WikidataArchaelog, WikidataCity, WikidataExtra, WikidataPopulation } from '../interfaces/wikidataCityData';
import { GOVKEY } from '../types/govkey';
import { Lang } from '../types/lang';
import { LngLat, Point, WGS84 } from '../util/WGS84';


const BASEURL_LOBID = 'https://lobid.org/gnd/search?format=json&q=';
const BASEURL_WIKIDATA_SPARQL = 'https://query.wikidata.org/sparql?format=json&query=';
const BASEURL_GETTY_SPARQL = 'http://vocab.getty.edu/sparql.json?query=';
const BASEURL_GEONAMES = 'http://api.geonames.org/';
const USER = "quenouil";

/* Geonames
http://api.geonames.org/searchJSON?q=leipzig&name_startsWith=leipzig&maxRows=50&country=&featureClass=P&continentCode=&fuzzy=0.6&username=quenouil
http://api.geonames.org/childrenJSON?geonameId=2879139&lang=de&username=quenouil
https://www.geonames.org/getJSON?id=2879139&style=gui&lang=de&username=quenouil

http://overpass-api.de/api/interpreter?data=[out:json];relation["de:amtlicher_gemeindeschluessel"="14713000"];(._;>;);out;
*/
export const getOverpass = async (ags: string): Promise<OVERPASS> => {
  const url = `http://overpass-api.de/api/interpreter?data=[out:json];relation["de:amtlicher_gemeindeschluessel"="${ags}"];(._;>;);out;`;
  const response = await fetch(url)
  return await response.json();
}

export const getOverpassLayer = async (wdId: string, [lon, lat]: LngLat): Promise<OVERPASS> => {
  const url = `http://overpass-api.de/api/interpreter?data=[out:json];
  is_in(${lat},${lon});
  (rel[boundary=administrative][wikidata=${wdId}](pivot);>;);out qt;`;
  const response = await fetch(url)
  return await response.json();
}

export const testtest = async (): Promise<{}> => {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&osm_id=62649&osm_type=R&polygon_geojson=1`;
  const response = await fetch(url)
  return await response.json();
}

export const getGeonamesSearch = async (search: string, lang: Lang, option: string[]): Promise<GeonamesSearch> => {
  const de = option?.includes('DE') ? 'de' : '';
  const eu = option?.includes('EU') ? 'eu' : '';
  const url = `${BASEURL_GEONAMES}searchJSON?name=${search}*&name_startsWith=${search}&lang=${lang}&isNameRequired=true&maxRows=50&country=${de}&featureClass=P&continentCode=${eu}&fuzzy=0.6&username=${USER}`;
  const response = await fetch(url)
  return await response.json();
}

export const getGeonamesEntity = async (id: string, lang: Lang): Promise<GeonameById> => {
  const url = `${BASEURL_GEONAMES}getJSON?id=${id}&style=gui&lang=${lang}&username=${USER}`;
  const response = await fetch(url)
  return await response.json();
}

export const getGeonamesChildren = async (id: string, lang: Lang): Promise<GeonamesSearch> => {
  const url = `${BASEURL_GEONAMES}childrenJSON?geonameId=${id}&lang=${lang}&username=${USER}`;
  const response = await fetch(url)
  return await response.json();
}

export const getSlubMaps = async (lngLat: LngLat, range: number): Promise<Maps> => {
  const center: Point = { coordinates: lngLat };
  const radius = 1 + range * 1.41;
  const polygon = WGS84.perimeterSquarePolynom(center, radius);
  const body = `{"query":{"filtered":{"filter":{"bool":{"must":[{"geo_shape":{"geometry":{"shape":{"type":"polygon","coordinates":[${JSON.stringify(polygon)}]}}}}]}}}}}`;
  const url = `https://kartenforum.slub-dresden.de/spatialdocuments/_search?from=0&size=100`;
  const response = await fetch(url, {
    body: body,
    headers: {'Content-Type': 'multipart/form-data'},
    method: 'post',
  });
  return await response.json();
}

/* export const getGeoPortOst3 = async (lngLat: LngLat, range: number, page: number): Promise<string>  => {
  const center: Point = { coordinates: lngLat };
  const radius = 1 + range * 1.41;
  const bbox = WGS84.bbox(center, radius);
  const url = `https://cors-anywhere.herokuapp.com/http://geoportal.ios-regensburg.de:8080/catalog?bbox=${bbox}&format=json&page=${page}`;
  const xhttp = new XMLHttpRequest();
  xhttp.overrideMimeType('text/plain');
  xhttp.open("get", url, false);
  //xhttp.setRequestHeader('Access-Control-Allow-Origin', '*');
  xhttp.send(null);
  return await xhttp.responseText;
} */

// https://github.com/gnuns/allorigins
export const getGeoPortOst = async (lngLat: LngLat, range: number, page: number, typ: string): Promise<AllOrigins> => {
  const mapTyp = typ === '' ? '' : `&f[dc_type_s][]=${typ}`;
  const center: Point = { coordinates: lngLat };
  const radius = 1 + range * 1.41;
  const bbox = WGS84.bbox(center, radius);
  const url = `http://geoportal.ios-regensburg.de/catalog?bbox=${bbox}&format=json&page=${page}${mapTyp}`;
  console.log(url);
  const response = await fetch(
    `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
    {headers: new Headers({'content-type': 'application/json'})}
  );
  return await response.json();
}

export const getLobid = async (lobidId: string): Promise<LobidJson> => {
  const id = `gndIdentifier:${lobidId}`;
  const filter = '&filter=type:TerritorialCorporateBodyOrAdministrativeUnit';
  const url = `${BASEURL_LOBID}${id}${filter}&size=1`;
  const response = await fetch(url)
  return await response.json();
}
export const getLobidSearch = async (search: string): Promise<LobidJson> => {
  const name = `preferredName:${search}*`;
  const filter = '&filter=type:TerritorialCorporateBodyOrAdministrativeUnit';
  const url = `${BASEURL_LOBID}${name}${filter}&size=500`;
  const response = await fetch(url)
  return await response.json();
}

export const getGovObject = async (govId: string): Promise<Document> => {
  const url = `http://gov.genealogy.net/semanticWeb/about/${govId}`;
  const parser = new DOMParser();
  return await fetch(url)
    .then(response => response.text())
    .then(data => parser.parseFromString(data, 'application/xml'))
}

export const getGovSearch = async (key: GOVKEY, id: String) => {
  const body = `system=${key}&ref=${id}`;
  const url = `http://gov.genealogy.net/search/externalRef`;
  return await fetch(url, {
    body: body,
    headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
    method: 'post',
  });
}

export const ifExistGovId = async (id: string) => {
  const url = `http://gov.genealogy.net/item/show/${id}`;
  return await fetch(url, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Accept': '*/*'
    },
    method: 'get',
  });
} 

export const getWbSearchEntities = async (search: string, lang: Lang, limit: number): Promise<WbSearch> => {
  const BASEURL_WIKIDATA = 'https://www.wikidata.org/w/api.php?action=';
  const url = `${BASEURL_WIKIDATA}wbsearchentities&search=${search}&origin=*&format=json&language=${lang}&uselang=${lang}&limit=${limit}`;
  const response = await fetch(url)
  return await response.json();
}

export const getWikidataCityData = async (id: string, lang: Lang): Promise<WikidataCity> => {
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
  const url = `${BASEURL_WIKIDATA_SPARQL}${SELECT}`;
  const response = await fetch(url)
  return await response.json();
}

export const getWikidataCityPopulation = async (id: string): Promise<WikidataPopulation> => {
  const SELECT = `SELECT ?population ?date WHERE {
    VALUES ?city {wd:${id}}
    ?city p:P1082 ?_.
    ?_ ps:P1082 ?population.
    optional {?_ pq:P585 ?date.}
  }
  ORDER BY DESC(?date)`;
  const url = `${BASEURL_WIKIDATA_SPARQL}${SELECT}`;
  const response = await fetch(url)
  return await response.json();
}

export const getWikidataCityExtra = async (id: string, lang: Lang): Promise<WikidataExtra> => {
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

  const url = `${BASEURL_WIKIDATA_SPARQL}${SELECT}`;
  const response = await fetch(url)
  return await response.json();
}

// Q23413 Burg
// Q839954 Archälogische Stätte
// Q16970 Kirchen
// Q178561 Schlacht
export const getWikidataArchaelog = async (lang: Lang, lngLat: LngLat, radius: number, obj: string = 'Q839954'): Promise<WikidataArchaelog> => {
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
    ?ort wdt:P31/wdt:P279* wd:${obj} .
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

  const url = `${BASEURL_WIKIDATA_SPARQL}${SELECT}`;
  const response = await fetch(url)
  return await response.json();
}

export const getGettyNoteAndNames = async (id: string): Promise<GettyJson> => {
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
  const url = `${BASEURL_GETTY_SPARQL}${SELECT}`;
  const response = await fetch(url)
  return await response.json();
}
export const getGettyPlaceTypes = async (id: string): Promise<GettyJson> => {
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
  const url = `${BASEURL_GETTY_SPARQL}${SELECT}`;
  const response = await fetch(url)
  return await response.json();
}  


export const getDbPedia = async (ags: string): Promise<DbPediaJson> => {
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


/* 
SELECT ?wasLabel ?ab ?bis ?x
(GROUP_CONCAT(DISTINCT(?ref); SEPARATOR=";") AS ?referenz)
WHERE {
  VALUES ?city {wd:Q2079}
  # wd:Q64 p:P31 ?_. #P31 P1376
  {
    VALUES ?x {'ist eine'}
    ?city p:P31 ?_.
    optional{ ?_ ps:P31 ?was.}  
    optional{ ?_ pq:P580 ?ab.}
    optional{ ?_ pq:P582 ?bis.}
    optional{ ?_ prov:wasDerivedFrom [ pr:P854 ?ref ].}
  } UNION {
    VALUES ?x {'administrative Einheit von'}
    ?city p:P1376 ?_.
    optional{ ?_ ps:P1376 ?was.}  
    optional{ ?_ pq:P580 ?ab.}
    optional{ ?_ pq:P582 ?bis.}
    optional{ ?_ prov:wasDerivedFrom [ pr:P854 ?ref ].}
  } UNION {
    VALUES ?x {'liegt in der Verwaltungseinheit'}
    ?city p:P131 ?_.
    optional{ ?_ ps:P131 ?was.}  
    optional{ ?_ pq:P580 ?ab.}
    optional{ ?_ pq:P582 ?bis.}
    optional{ ?_ prov:wasDerivedFrom [ pr:P854 ?ref ].}
  } UNION {
    VALUES ?x {'Einwohner'}
    ?city p:P1082 ?_.
    optional{ ?_ ps:P1082 ?was.}  
    optional{ ?_ pq:P585 ?ab.}
    optional{ ?_ prov:wasDerivedFrom [ pr:P854 ?ref ].}
  } UNION {
    VALUES ?x {'wichtige Ereignisse'}
    ?city p:P793 ?_.
    optional{ ?_ ps:P793 ?was.}  
    optional{ ?_ pq:P585 ?ab.}
    optional{ ?_ prov:wasDerivedFrom [ pr:P854 ?ref ].}
  } UNION {
    VALUES ?x {'Postleitzahl'}
    ?city p:P281 ?_.
    optional{ ?_ ps:P281 ?was.}  
    optional{ ?_ pq:P580 ?ab.}
    optional{ ?_ pq:P582 ?bis.}
    optional{ ?_ prov:wasDerivedFrom [ pr:P854 ?ref ].}
  }
  


  
  
SERVICE wikibase:label { bd:serviceParam wikibase:language "de". }
}
GROUP BY ?wasLabel ?ab ?bis ?x
#ORDER BY DESC(?ab) */