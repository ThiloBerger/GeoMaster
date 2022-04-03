export interface LobidLockup {
    category: string,
    id: string,
    image: string,
    label: string
}

export interface LobidJson {
    member: LobidItems[]
}

export interface LobidItems {
    type: string[],
    gndIdentifier: string,
    relatedTerm: LobidString[],
    relatedPlaceOrGeographicName: LobidString[],
    geographicAreaCode: LobidString[];
    hasGeometry: LobibGeometry[],
    biographicalOrHistoricalInformation: string[],
    preferredName: string
    wikipedia: LobidString[],
    variantName: string[],
    homepage: LobidString[],
    sameAs: LobidSameAs[],
    broaderTermInstantial: LobidString[],
    hierarchicalSuperiorOfPlaceOrGeographicName: LobidString[],
    dateOfEstablishment: string[],
    dateOfTermination: string[],
    broaderTermPartitive: LobidString[],
    precedingPlaceOrGeographicName: LobidString[],
    definition: string[],
    succeedingPlaceOrGeographicName: LobidString[],
    gndSubjectCategory: LobidString[],
    placeOfBusiness: LobidString[],
    dateOfEstablishmentAndTermination: string[],
    dateOfProduction: string[],
    place: LobidString[],
    temporaryNameOfThePlaceOrGeographicName: LobidString[],
}

export interface LobidString {
    id: string,
    label: string
}

export interface LobibGeometry {
    asWKT: string[],
    type: string
}

export interface LobidSameAs {
    id: string
    collection: LobidSameAsColletion,
}

export interface LobidSameAsColletion {
    id: string,
    name?: string,
    icon?: string,
    publisher?: string,
    abbr?: string
}



