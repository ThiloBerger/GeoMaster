export interface ArgGisJson {
    "features": ArgGisFeatures[]
}
export interface ArgGisFeatures {
        attributes: {
          plz: string,
          ags: string,
          einwohner: number
        }
}