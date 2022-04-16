import { createContext } from "react";
import { ArgGisFeatures } from "../interfaces/ArgGis";
import { DbPediaInfo } from "../interfaces/dbpediaJson";
import { GeonameData } from "../interfaces/geonamesSearch";
import { GettyItem } from "../interfaces/gettyJson";
import { GndData } from "../interfaces/GndJson";
import { GovData } from "../interfaces/govRdf";
import { OverpassItem } from "../interfaces/overpass";
import { WikidataCardResult, WikidataExtraResult, WikidataPopulationResult } from "../interfaces/wikidataCityData";
import { Table } from '../types/table';

export type typeGlobal = {
    search: string,
    dbpedia: {
        data: DbPediaInfo[]
    },
    esri: {
        data: ArgGisFeatures[]
    },
    geonames: { 
        id: string,
        data: GeonameData
    },
    gnd: {
        id: string,
        data: GndData
    },
    gov: {
        id: string,
        data: GovData
    },
    overpass: {
        geojson: any,
        data: OverpassItem
    },   
    tgn: {
        id: string,
        data: GettyItem[],
        places: GettyItem[]
    },
    wikidata: {
        id: string,
        table: Table,
        population: WikidataPopulationResult[],
        extra: WikidataExtraResult,
        archaelog: WikidataCardResult[],
        castle: WikidataCardResult[],
        church: WikidataCardResult[],
        battle: WikidataCardResult[],
        cave: WikidataCardResult[],
        katastrophe: WikidataCardResult[]
    }
}
export const defaultGlobal: typeGlobal = {
    search: 'empty',
    dbpedia: {
        data: []
    },
    esri: {
        data: []
    },
    geonames: {
        id: '',
        data: {} as GeonameData
    },
    gnd: {
        id: '',
        data: {} as GndData
    },
    gov: {
        id: '',
        data: {} as GovData
    },
    overpass: {
        geojson: JSON.parse('{}'),
        data: JSON.parse('{}')
    },
    tgn: {
        id: '',
        data: [],
        places: []
    },
    wikidata: {
        id: '',
        table: [],
        population: [],
        extra: JSON.parse('{}'),
        archaelog: [],
        castle: [],
        church: [],
        battle: [],
        cave: [],
        katastrophe: []
    }
};
export const globalvalue = {...defaultGlobal};   
export const Global = createContext<typeGlobal>(defaultGlobal);