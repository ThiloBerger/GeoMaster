export class WGS84 {
  // Semi-Major Axis (Equatorial Radius)
  private static readonly SEMI_MAJOR_AXIS = 6378137.0;
  private static readonly SEMI_MAJOR_AXIS_2 = WGS84.SEMI_MAJOR_AXIS * WGS84.SEMI_MAJOR_AXIS;
  // Semi-Minor Axis
  private static readonly SEMI_MINOR_AXIS = 6356752.314245;
  private static readonly SEMI_MINOR_AXIS_2 = WGS84.SEMI_MINOR_AXIS * WGS84.SEMI_MINOR_AXIS;

  private static readonly eccSquared = 0.00669438;
  private static readonly eccSquared_2 = WGS84.eccSquared * WGS84.eccSquared;
  private static readonly eccSquared_3 = WGS84.eccSquared_2 * WGS84.eccSquared;




  static convertLatLngToUtm = (latitude: number, longitude: number) => {
    
    const DEG2RAD = Math.PI / 180.0;
    const k0 = 0.9996;
    var LongTemp = longitude;
    const LatRad = latitude * DEG2RAD;
    const LongRad = LongTemp * DEG2RAD;
    let ZoneNumber;

    if (LongTemp >= 8 && LongTemp <= 13 && latitude > 54.5 && latitude < 58)
      ZoneNumber = 32;
    else if (
      latitude >= 56.0 &&
      latitude < 64.0 &&
      LongTemp >= 3.0 &&
      LongTemp < 12.0
    )
      ZoneNumber = 32;
    else {
      ZoneNumber = Math.floor((LongTemp + 180) / 6 + 1);
      if (latitude >= 72.0 && latitude < 84.0) {
        if (LongTemp >= 0.0 && LongTemp < 9.0) ZoneNumber = 31;
        else if (LongTemp >= 9.0 && LongTemp < 21.0) ZoneNumber = 33;
        else if (LongTemp >= 21.0 && LongTemp < 33.0) ZoneNumber = 35;
        else if (LongTemp >= 33.0 && LongTemp < 42.0) ZoneNumber = 37;
      }
    }

    const LongOrigin = (ZoneNumber - 1) * 6 - 180 + 3; //+3 puts origin in middle of zone
    const LongOriginRad = LongOrigin * DEG2RAD;
    const UTMZone = WGS84.getUtmLetterDesignator(latitude);
    const eccPrimeSquared = WGS84.eccSquared / (1 - WGS84.eccSquared);

    const N = WGS84.SEMI_MAJOR_AXIS / Math.sqrt(1 - WGS84.eccSquared * Math.sin(LatRad) * Math.sin(LatRad));
    const T = Math.tan(LatRad) * Math.tan(LatRad);
    const C = eccPrimeSquared * Math.cos(LatRad) * Math.cos(LatRad);
    const A = Math.cos(LatRad) * (LongRad - LongOriginRad);
    const A2 = A * A, A3 = A2 * A, A4 = A3 * A, A5 = A4 * A, A6 = A5 * A;
    const T2 = T * T;

    const M = WGS84.SEMI_MAJOR_AXIS * ((1 - WGS84.eccSquared / 4 - (3 * WGS84.eccSquared_2) / 64 - (5 * WGS84.eccSquared_3) / 256)
     * LatRad - ((3 * WGS84.eccSquared) / 8 + (3 * WGS84.eccSquared_2) / 32 + (45 * WGS84.eccSquared_3) / 1024)
     * Math.sin(2 * LatRad) + ((15 * WGS84.eccSquared_2) / 256 + (45 * WGS84.eccSquared_3) / 1024)
     * Math.sin(4 * LatRad) - ((35 * WGS84.eccSquared_3) / 3072) * Math.sin(6 * LatRad));

    let UTMEasting = k0 * N * (A + ((1 - T + C) * A3) / 6 + ((5 - 18 * T + T2 + 72 * C - 58 * eccPrimeSquared) * A5) / 120)
     + 500000.0;

    let UTMNorthing = k0 * (M + N * Math.tan(LatRad) * ((A2) / 2 + ((5 - T + 9 * C + 4 * C * C) * A4) / 24
     + ((61 - 58 * T + T2 + 600 * C - 330 * eccPrimeSquared) * A6) / 720));

    if (latitude < 0) UTMNorthing += 10000000.0;
    return {
      Easting: Math.floor(UTMEasting),
      Northing: Math.floor(UTMNorthing),
      ZoneNumber: Math.floor(ZoneNumber),
      ZoneLetter: UTMZone,
    };
  };

  private static getUtmLetterDesignator = function (latitude: number): string {
    if (84 >= latitude && latitude >= 72) return 'X';
    if (72 > latitude && latitude >= 64) return 'W';
    if (64 > latitude && latitude >= 56) return 'V';
    if (56 > latitude && latitude >= 48) return 'U';
    if (48 > latitude && latitude >= 40) return 'T';
    if (40 > latitude && latitude >= 32) return 'S';
    if (32 > latitude && latitude >= 24) return 'R';
    if (24 > latitude && latitude >= 16) return 'Q';
    if (16 > latitude && latitude >= 8) return 'P';
    if (8 > latitude && latitude >= 0) return 'N';
    if (0 > latitude && latitude >= -8) return 'M';
    if (-8 > latitude && latitude >= -16) return 'L';
    if (-16 > latitude && latitude >= -24) return 'K';
    if (-24 > latitude && latitude >= -32) return 'J';
    if (-32 > latitude && latitude >= -40) return 'H';
    if (-40 > latitude && latitude >= -48) return 'G';
    if (-48 > latitude && latitude >= -56) return 'F';
    if (-56 > latitude && latitude >= -64) return 'E';
    if (-64 > latitude && latitude >= -72) return 'D';
    if (-72 > latitude && latitude >= -80) return 'C';
    return 'Z';
  };

  /**
   * Calculate the destination point from this point having travelled the given
   * distance in meters on the given initial bearing
   * Uses Vincenty direct calculation
   * Adapted from http://www.movable-type.co.uk/scripts/latlong-vincenty.html
   *
   * @param   {Point} point  GeoJSON point
   * @param   {number} bearing  initial bearing in degrees from north
   * @param   {number} distance  distance along bearing in meters
   * @returns {object} GeoJSON destination point, finalBearing
   * @throws  {Error}  if formula failed to converge
   */
  static destination = (point: Point, bearing: number, distance: number): Point => {
    // f = 1/298.257223563
    const FLATTENING = 0.0033528106647474805;


    const DEG2RAD = Math.PI / 180.0;
    const alpha1 = bearing * DEG2RAD;
    const s = distance;
    const sinAlpha1 = Math.sin(alpha1);
    const cosAlpha1 = Math.cos(alpha1);
    const tanU1 =
        (1 - FLATTENING) * Math.tan(point.coordinates[1] * DEG2RAD),
      cosU1 = 1 / Math.sqrt(1 + tanU1 * tanU1),
      sinU1 = tanU1 * cosU1;
    const sigma1 = Math.atan2(tanU1, cosAlpha1);
    const sinAlpha = cosU1 * sinAlpha1;
    const cosSqAlpha = 1 - sinAlpha * sinAlpha;
    const uSq = (cosSqAlpha * (WGS84.SEMI_MAJOR_AXIS_2 - WGS84.SEMI_MINOR_AXIS_2)) / WGS84.SEMI_MINOR_AXIS_2;
    const A =
      1 + (uSq / 16384) * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));
    const B = (uSq / 1024) * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));

    var cos2SigmaM: number, sinSigma: number, cosSigma: number, deltaSigma: number;
    var sigma = s / (WGS84.SEMI_MINOR_AXIS * A), sigmaPrime: number, iterations = 0;

    do {
      cos2SigmaM = Math.cos(2 * sigma1 + sigma);
      sinSigma = Math.sin(sigma);
      cosSigma = Math.cos(sigma);
      deltaSigma = B * sinSigma * (cos2SigmaM + (B / 4) *
        (cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) - (B / 6) * cos2SigmaM *
        (-3 + 4 * sinSigma * sinSigma) * (-3 + 4 * cos2SigmaM * cos2SigmaM)));
      sigmaPrime = sigma;
      sigma = s / (WGS84.SEMI_MINOR_AXIS * A) + deltaSigma;
    } while (Math.abs(sigma - sigmaPrime) > 1e-12 && ++iterations < 200);

    const x = sinU1 * sinSigma - cosU1 * cosSigma * cosAlpha1;
    const phi2 = Math.atan2(
      sinU1 * cosSigma + cosU1 * sinSigma * cosAlpha1,
      (1 - FLATTENING) * Math.sqrt(sinAlpha * sinAlpha + x * x)
    );
    const lambda = Math.atan2(
      sinSigma * sinAlpha1,
      cosU1 * cosSigma - sinU1 * sinSigma * cosAlpha1
    );
    const C = (FLATTENING / 16) * cosSqAlpha * (4 + FLATTENING * (4 - 3 * cosSqAlpha));
    const L = lambda - (1 - C) * FLATTENING * sinAlpha * (sigma + C * sinSigma *
            (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)));
    const lambda2 =
      (((point.coordinates[0] * DEG2RAD) + L + 3 * Math.PI) %
        (2 * Math.PI)) - Math.PI; // normalise to -180...+180

    return {
      coordinates: [
        Number((lambda2 / DEG2RAD).toFixed(10)),
        Number((phi2 / DEG2RAD).toFixed(10)),
      ],
    };
  };

  static perimeterSquarePolynom = (center: Point, radius: number): LngLat[] => {
    const lu: LngLat = [
      WGS84.destination(center, 225, radius).coordinates[0],
      WGS84.destination(center, 225, radius).coordinates[1],
    ];
    const lo: LngLat = [
      WGS84.destination(center, 315, radius).coordinates[0],
      WGS84.destination(center, 315, radius).coordinates[1],
    ];
    const ro: LngLat = [
      WGS84.destination(center, 45, radius).coordinates[0],
      WGS84.destination(center, 45, radius).coordinates[1],
    ];
    const ru: LngLat = [
      WGS84.destination(center, 135, radius).coordinates[0],
      WGS84.destination(center, 135, radius).coordinates[1],
    ];
    return [lu, lo, ro, ru, lu];
  };

  static bbox = (center: Point, radius: number): string => {
    const lu: LngLat = [
      WGS84.destination(center, 225, radius).coordinates[0],
      WGS84.destination(center, 225, radius).coordinates[1],
    ];
    const ro: LngLat = [
      WGS84.destination(center, 45, radius).coordinates[0],
      WGS84.destination(center, 45, radius).coordinates[1],
    ];
    return `${lu[0]} ${lu[1]} ${ro[0]} ${ro[1]}`;
  }

  static pointInPolygon(lngLat: LngLat, polygon: Polygon) {

    const [x, y] = lngLat;
    let tmpX;
    let tmpY;
    let crossings = 0;
    const polygonX: number[] = [];
    const polygonY: number[] = [];

    polygon.forEach(p => { 
      polygonX.push(p[0]); 
      polygonY.push(p[1]);
    });
  
    for ( let i = 0; i < polygonX.length; i++) {
      if( polygonX[i] < polygonX[(i + 1) % polygonX.length]) {
        tmpX = polygonX[i];
        tmpY = polygonX[(i + 1) % polygonX.length];
      } else {
        tmpX = polygonX[(i + 1) % polygonX.length];
        tmpY = polygonX[i];
      }

      if (x > tmpX && x <= tmpY && (y < polygonY[i] || y <= polygonY[(i + 1) % polygonX.length])) {

        const dx = polygonX[(i + 1) % polygonX.length] - polygonX[i];
        const dy = polygonY[(i + 1) % polygonX.length] - polygonY[i];

        const eps = 0.000001;
        let k = Number.MAX_SAFE_INTEGER / 180;
        if (Math.abs(dx) >= eps) k = dy / dx;

        const m = polygonY[i] - k * polygonX[i];
        const y2 = k * x + m;
        if (y <= y2) crossings++;
      }
    }
  
    return (crossings % 2 === 1);
  }
}

export interface Point {
  coordinates: LngLat
}
export type LngLat = [number, number];
export type Polygon = [LngLat];