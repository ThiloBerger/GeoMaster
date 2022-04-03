export interface OVERPASS {
    elements: OverpassItem[]
}

export interface OverpassItem {
    type: "relation" | "node",
    lat: number,
    lon: number,
    id: number,
    tags: {
        "contact:website": string,
        "de:amtlicher_gemeindeschluessel": string,
        "de:regionalschluessel": string,
        nickname: string,
        "note:de": string,
        official_name: string,
        population: string,
        wikidata: string,
    }
}