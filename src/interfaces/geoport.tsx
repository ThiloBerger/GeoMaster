export interface AllOrigins {
  contents: string;
  status: AllOriginsStatus;
}

export interface AllOriginsStatus {
  url: string;
  content_type: string;
  content_length: number;
  http_code: number;
  response_time: number;
}

export interface GeoPortJSON {
  response: GeoPortResponse;
}
export interface GeoPortResponse {
  docs: GeoPortDoc[];
  facets: GeoPortFacets[];
  pages: GeoPortPages;
}

export interface GeoPortDoc {
  geoblacklight_version: string;
  dc_identifier_s: string;
  layer_slug_s: string;
  layer_id_s: string;
  layer_geom_type_s: string;
  dc_format_s: string;
  dct_provenance_s: string;
  dc_language_s: string;
  dc_rights_s: string;
  dc_title_s: string;
  dc_type_s: string;
  dct_isPartOf_sm: string[];
  dc_spatial_sm: string[];
  dc_spatial_en_sm: string[];
  dct_spatial_sm: string[];
  dct_license_s: string;
  dct_isFormatOf_s: string;
  dct_references_s: string;
  solr_geom: string;
  dct_requires_s: string;
  rdfs_seeAlso_s: string;
  owl_sameAs_s: string;
  thumbnail_path_ss: string;
  rdagr1_dimensionsOfMapEtc_s: string;
  maps_hasScale_i: number;
  bibo_uri_s: string;
  _version_: number;
  timestamp: string;
  score: number;
}

export interface GeoPortFacets {
  name: string,
  items: GeoPortMapType[],
  label: string
}

export interface GeoPortPages {
  current_page: number;
  next_page: number | null;
  prev_page: number | null;
  total_pages: number;
  limit_value: number;
  offset_value: number;
  total_count: number;
  "first_page?": boolean;
  "last_page?": boolean;
}

export interface GeoPortMapType {
  value: string,
  hits: number,
  label: string
}