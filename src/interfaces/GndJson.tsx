export interface GndLockup {
    category: string,
    id: string,
    image: string,
    label: string
}

export interface GndJson {
    member: GndItems[]
}

export interface GndItems {
    type: string[],
    gndIdentifier: string,
    relatedTerm: GndString[],
    relatedPlaceOrGeographicName: GndString[],
    geographicAreaCode: GndString[];
    hasGeometry: LobibGeometry[],
    biographicalOrHistoricalInformation: string[],
    preferredName: string
    wikipedia: GndString[],
    variantName: string[],
    homepage: GndString[],
    sameAs: GndSameAs[],
    broaderTermInstantial: GndString[],
    hierarchicalSuperiorOfPlaceOrGeographicName: GndString[],
    dateOfEstablishment: string[],
    dateOfTermination: string[],
    broaderTermPartitive: GndString[],
    precedingPlaceOrGeographicName: GndString[],
    definition: string[],
    succeedingPlaceOrGeographicName: GndString[],
    gndSubjectCategory: GndString[],
    placeOfBusiness: GndString[],
    dateOfEstablishmentAndTermination: string[],
    dateOfProduction: string[],
    place: GndString[],
    temporaryNameOfThePlaceOrGeographicName: GndString[],
    fuzzy?: number // for fuzzy search
}

export interface GndString {
    id: string,
    label: string
}

export interface LobibGeometry {
    asWKT: string[],
    type: string
}

export interface GndSameAs {
    id: string
    collection: GndSameAsColletion,
}

export interface GndSameAsColletion {
    id: string,
    name?: string,
    icon?: string,
    publisher?: string,
    abbr?: string
}



