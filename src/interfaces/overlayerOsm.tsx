import { LngLat } from "../util/WGS84";
import { OVERPASS } from "./overpass";

export interface OverlayerOsm {
    data: OVERPASS,
    logLat: LngLat
}