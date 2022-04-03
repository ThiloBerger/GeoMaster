export interface GeonamesSearch {
  totalResultsCount: number,
  geonames: GeonamesSearchItem[]
}
export interface GeonamesSearchItem {
    adminCode1: string,
    lng: string,
    geonameId: number,
    toponymName: string,
    countryId: string,
    fcl: string,
    population: number
    countryCode: string,
    name: string,
    fclName: string,
    adminCodes1: AdminCodes1,
    countryName: string,
    fcodeName: string,
    adminName1: string,
    lat: string,
    fcode: string
}

export interface AdminCodes1 {
    ISO3166_2: string
}

export interface GeonameById {
    adminCode1: string,
    adminCode2: string,
    adminCode3: string,
    adminCode4: string,
    adminCode5: string,
    adminCodes1: AdminCodes1,
    adminId1: string,
    adminId3: string,
    adminId4: string,
    adminId5: string,
    adminName1: string,
    adminName2: string,
    adminName3: string,
    adminName4: string,
    adminName5: string,
    alternateNames: AlternateNames[],
    asciiName: string,
    astergdem: number,
    bbox: Bbox,
    continentCode: string,
    countryCode: string,
    countryId: string,
    countryName: string,
    fcl: string,
    fclName: string,
    fcode: string,
    fcodeName: string,
    geonameId: number,
    hasShape: string,
    lat: string,
    lng: string,
    name: string,
    population: number,
    srtm3: number,
    timezone: Timezone,
    toponymName: string,
    url: string,
    wikipediaURL: string
}

export interface AlternateNames {
    lang: string,
    name: string
}

export interface Bbox {
    accuracyLevel: number,
    east: number,
    north: number,
    south: number,
    west: number
}

export interface Timezone {
    dstOffset: number,
    gmtOffset: number,
    timeZoneId: string
}



