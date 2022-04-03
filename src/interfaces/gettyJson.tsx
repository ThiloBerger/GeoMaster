export interface GettyJson {
    head: GettyVars,
    results: GettyResults
}

export interface GettyVars {
    vars: string []
}

export interface GettyResults {
    bindings: GettyItem []
}

export interface GettyItem {
    ScopeNote: GettyObject,
    lab: GettyObject,
    start: GettyDate,
    end: GettyDate,
    comment: GettyLabel,
    historic: GettyLabel,
    object: GettyObject,
    objectID?: GettyLabel
}

export interface GettyObject {
    'xml:lang': string,
    type: string,
    value: string
}

export interface GettyLabel {
    type: string,
    value: string
}

export interface GettyDate {
    datatype: string,
    type: string,
    value: string
}
