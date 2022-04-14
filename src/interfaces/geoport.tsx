export interface GeoPortOstSparQl {
  head: {
      "vars": [
          "url",
          "title",
          "id",
          "year",
          "typ",
          "scale",
          "gnd",
          "thumb",
          "area",
          "keywords"
      ]
  },
  results: {
      bindings: GeoPostOstMaps []
  }
}
export interface GeoPostOstMaps {
  url: GeoPostOstMapsParams,
  title: GeoPostOstMapsParams,
  id: GeoPostOstMapsParams,
  year: GeoPostOstMapsParams,
  typ: GeoPostOstMapsParams,
  scale: GeoPostOstMapsParams
  gnd: GeoPostOstMapsParams,
  thumb: GeoPostOstMapsParams,
  area: GeoPostOstMapsParams,
  keywords: GeoPostOstMapsParams
}

export interface GeoPostOstMapsParams {
  type: string;
  value: string;
}