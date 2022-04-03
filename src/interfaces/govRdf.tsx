export interface GovRdf{
    'rdf:RDF': GovDescription
} 

export interface GovDescription {
    'rdf:Description': GovDescriptionItem
}

export interface GovDescriptionItem {
    'dc:modified': string,
    'cc:attributionName': string,
    'cc:attributionURL': string,
    'cc:license': string,
    'foaf:primaryTopic': GovPrimaryTopic
}

export interface  GovPrimaryTopic {
    'gov:GovObject': GovObject
}

export interface GovObject {
    'gov:hasPopulation': GovPopulation[],
    'gov:note': GovNote | GovNote[],
    'gov:isPartOf': GovPartOf | GovPartOf[],
    'gov:hasType': GovType | GovType[],
    'gov:hasURL': GovUrl | GovUrl[],
    'owl:sameAs': string | string[],
    'gov:hasPostalCode': GovPostalCode[],
    'gov:position': GovPosition,
    'gov:hasMunicipalityId': GovMunicipalityId | GovMunicipalityId[],
    'gov:positionPrecision': string,
    'gov:hasName': GovName | GovName[],
    'rdfs:isDefinedBy': string,
    'gov:hasArea': GovArea | GovArea[]
}

export interface GovArea {
    'gov:PropertyForObject': GovPropertyForObject
}

export interface GovPopulation {
    'gov:PropertyForObject': GovPropertyForObject
}

export interface GovPropertyForObject {
    'gov:source'?: GovSource | GovSource[],
    'gov:timeEnd'?: string,
    'gov:timeBegin'?: string,
    'gov:value'?: string,
    'gov:ref'?: string[]
}

export interface GovSource {
    'gov:SourceReference': GovSourceReference
}

export interface GovSourceReference {
    'gov:sourceRef': string[]
}

export interface GovNote {
    'gov:Note': {
        'gov:noteText': string
    }
}

export interface GovPartOf {
    'gov:Relation': GovRelation
}

export interface GovRelation {
    'gov:timeEnd': string,
    'gov:timeBegin': string,
    'gov:ref': string[]
}

export interface GovType {
    'gov:PropertyType': GovPropertyType
}

export interface GovPropertyType {
    'gov:timeEnd'?: string,
    'gov:timeBegin'?: string,
    'gov:type': string[]
}

export interface GovUrl {
    'gov:PropertyForObject': GovPropertyForObject
}

export interface GovPostalCode {
    'gov:PropertyForObject': GovPropertyForObject
}

export interface GovPosition {
    'wgs84:Point': WGS84Point
}

export interface WGS84Point {
    'wgs84:lon': string,
    'wgs84:lat': string
}

export interface GovMunicipalityId {
    'gov:PropertyForObject': GovPropertyForObject
}
export interface GovName {
    'gov:PropertyName': GovPropertyName
}

export interface GovPropertyName {
    'gov:timeEnd'?: string,
    'gov:timeBegin'?: string,    
    'gov:language': string,
    'gov:value': string
}
