export interface DbPediaJson {
  head: { 
      link: [], 
      vars: string[]
    },
  results: {
    distinct: boolean,
    ordered: boolean,
    bindings: DbPediaInfo[]
  };
}

export interface DbPediaInfo {
  info: {
    type: string;
    "xml:lang": string;
    value: string;
  };
}
