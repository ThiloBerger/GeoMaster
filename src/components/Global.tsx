import { createContext } from "react";
import { DbPediaInfo } from "../interfaces/dbpediaJson";
import { GeonameById } from "../interfaces/geonamesSearch";
import { GettyItem } from "../interfaces/gettyJson";
import { GndItems } from "../interfaces/GndJson";
import { GovObject } from "../interfaces/govRdf";
import { OverpassItem } from "../interfaces/overpass";
import { WikidataCardResult, WikidataExtraResult, WikidataPopulationResult } from "../interfaces/wikidataCityData";
import { Table } from '../types/table';

export type typeGlobal = {
    search: string,
    dbpedia: {
        data: DbPediaInfo[]
    }
    geonames: { 
        id: string,
        data: GeonameById
    }
    gnd: {
        id: string,
        data: GndItems
    },
    gov: {
        id: string,
        data: GovObject
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
    search: 'nur so',
    dbpedia: {
        data: []
    },
    geonames: {
        id: '',
        data: JSON.parse('{}')
    },
    gnd: {
        id: '',
        data: JSON.parse('{}')
    },
    gov: {
        id: '',
        data: JSON.parse('{}')
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