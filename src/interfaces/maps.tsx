export interface Maps {
    took: number,
    timed_out: boolean,
    _shards: {}
    hits: Hits
}

export interface Hits {
    total: number,
    max_score: number,
    hits: Hit[]
}

export interface Hit {
    _index: string,
    _type: string,
    _id: string,
    _score: number,
    _source: Source
}

export interface Source {
    dataid: string,
    clippolygon: [],
    description: string,
    denominator: number,
    zoomify: string,
    maptype: string,
    org: string,
    keywords: string,
    titlelong: string,
    id: number,
    plink: string,
    'online-resources': OnlineRes,
    tms: string,
    thumb: string,
    title: string,
    geometry: {},
    georeference: true,
    time: string
}

export interface OnlineRes {
    url: string,
    type: string
}