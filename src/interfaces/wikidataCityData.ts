export interface WikidataCity {
  head: {
    vars: string[];
  };
  results: {
    bindings: WikidataCityResult[];
  };
}

export interface WikidataDateGroup {
  admin: WikidataCityResult[];
  create: WikidataCityResult[];
  is: WikidataCityResult[];
  nickname: WikidataCityResult[];
  originname: WikidataCityResult[];
}

export interface WikidataCityResult {
  property: WikiProperty;
  propertyLabel: WikiProperty;
  x?: WikiProperty;
  group?: string;
  ab: WikiDate;
  bis: WikiDate;
  lid: { type: string; value: string };
}

export interface WikiProperty {
  type: string;
  value: string;
  "xml:lang": string;
}

export interface WikiDate {
  datatype: string;
  type: string;
  value: string;
}

export interface WikiValue {
  type: string;
  value: string;
}

// -----------------------------------------------

export interface WikidataPopulation {
  head: {
    vars: string[];
  };
  results: {
    bindings: WikidataPopulationResult[];
  };
}

export interface WikidataPopulationResult {
  population: WikiDate;
  date: WikiDate;
}

// -----------------------------------------------

export interface WikidataExtra {
  head: {
    vars: string[];
  };
  results: {
    bindings: WikidataExtraResult[];
  };
}

export interface WikidataExtraResult {
  area: WikiDate;
  audioLabel: WikiValue;
  lat: WikiDate;
  lon: WikiDate;
  height: WikiDate;
  logoLabel: WikiValue;
  imgLabel: WikiValue;
  mapLabel: WikiValue;
  mapDetailLabel: WikiValue;
  mapLocationLabel: WikiValue;
  flagLabel: WikiValue;
  armsLabel: WikiValue;
  sealLabel: WikiValue;
  time: WikiValue;
  timename: WikiValue;
  ort: WikiProperty;
}

// -----------------------------------------------

export interface WikidataArchaelog {
  head: {
    vars: string[];
  };
  results: {
    bindings: WikidataArchaelogResult[];
  };
}

export interface WikidataArchaelogResult {
  ort: WikiValue;
  lat: WikiDate;
  lon: WikiDate;
  distNum: WikiDate;
  imgLabel: WikiValue;
  ortLabel: WikiProperty;
  ortDescription: WikiProperty;
  subLabel: WikiProperty;
  subDescription: WikiProperty;
  ab: WikiDate;
}
