import { WikidataCityResult } from './wikidataCityData';

export interface TableGroup {
    group: string,
    lid: boolean,
    prop: boolean,
    items: WikidataCityResult[]
}