export interface WbSearch {
    search: WbSearchEntities[]
}

export interface WbSearchEntities {
    aliases?: string[],
    concepturi?: string,
    description: string,
    id: string,
    label: string,
    match?: Match,
    pageid?: number
    repository?: string,
    title?: string,
    url?: string
}

export interface Match {
    type: string,
    language: string,
    text: string
}

export interface riconciJson {
    result: [
        {
            description: string,
            features: [
                {
                    id: string,
                    value: number
                }
            ],
            id: string,
            match: boolean,
            name: string,
            score: number,
            type: [
                {
                    id: string,
                    name: string,
                }
            ]
        }
    ]
}