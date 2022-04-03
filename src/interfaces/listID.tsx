/**
 * Liste von ermittelten IDs + Flag ob bereits ein Call an die API rausging
 * Besonderheit: slub bekommt als id einen JSON-String mit Koordinaten
 * geoportost verwendet auch die id von slub
 */
export class ListID {
    wikidata = {id: '', apiCall: false, status: false};
    lobid = {id: '', apiCall: false, status: false};
    nuts2003 = {id: '', apiCall: false, status: false};
    nuts1999 = {id: '', apiCall: false, status: false};
    geonames = {id: '', apiCall: false, status: false};
    gov = {id: '', apiCall: false, status: false};
    getty = {id: '', apiCall: false, status: false};
    slub = {id: '', apiCall: false, status: false};
    geoportost = {id: '', apiCall: false, status: false};
}
