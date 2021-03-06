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




  static convertLatLngToUtm = (latitude: number, longitude: number): Record<string,string|number> => {
    
    const DEG2RAD = Math.PI / 180.0;
    const k0 = 0.9996;
    const LatRad = latitude * DEG2RAD;
    const LongRad = longitude * DEG2RAD;
    let ZoneNumber;

    if (longitude >= 8 && longitude <= 13 && latitude > 54.5 && latitude < 58)
      ZoneNumber = 32;
    else if (
      latitude >= 56.0 &&
      latitude < 64.0 &&
      longitude >= 3.0 &&
      longitude < 12.0
    )
      ZoneNumber = 32;
    else {
      ZoneNumber = Math.floor((longitude + 180) / 6 + 1);
      if (latitude >= 72.0 && latitude < 84.0) {
        if (longitude >= 0.0 && longitude < 9.0) ZoneNumber = 31;
        else if (longitude >= 9.0 && longitude < 21.0) ZoneNumber = 33;
        else if (longitude >= 21.0 && longitude < 33.0) ZoneNumber = 35;
        else if (longitude >= 33.0 && longitude < 42.0) ZoneNumber = 37;
      }
    }

    const LongOrigin = (ZoneNumber - 1) * 6 - 180 + 3; //+3 puts origin in middle of zone
    const LongOriginRad = LongOrigin * DEG2RAD;
    const UTMZone = WGS84.getUtmLetterDesignator(longitude, latitude);
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

  private static getUtmLetterDesignator = function (lon: number, lat: number): string {
    if (lat > 84) return lon < 0 ? 'Y' : 'Z';
    if (lat < -80) return lon < 0 ? 'A' : 'B';
    return "CDEFGHJKLMNPQRSTUVWXX"[Math.floor((lat + 80) / 8)];
  };

  /**
   * Calculate the destination point from this point having travelled the given
   * distance in meters on the given initial bearing
   * Uses Vincenty direct calculation
   * Adapted from http://www.movable-type.co.uk/scripts/latlong-vincenty.html
   *
   * @param   {LngLat} lngLat  GeoJSON point
   * @param   {number} bearing  initial bearing in degrees from north
   * @param   {number} distance  distance along bearing in meters
   * @returns {object} GeoJSON destination point, finalBearing
   * @throws  {Error}  if formula failed to converge
   */
  static destination = (lngLat: LngLat, bearing: number, distance: number): Point => {
    // f = 1/298.257223563
    const FLATTENING = 0.0033528106647474805;


    const DEG2RAD = Math.PI / 180.0;
    const alpha1 = bearing * DEG2RAD;
    const s = distance;
    const sinAlpha1 = Math.sin(alpha1);
    const cosAlpha1 = Math.cos(alpha1);
    const tanU1 =
        (1 - FLATTENING) * Math.tan(lngLat[1] * DEG2RAD),
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
      (((lngLat[0] * DEG2RAD) + L + 3 * Math.PI) %
        (2 * Math.PI)) - Math.PI; // normalise to -180...+180

    return {
      coordinates: [
        Number((lambda2 / DEG2RAD).toFixed(10)),
        Number((phi2 / DEG2RAD).toFixed(10)),
      ],
    };
  };

  static pointToBbox = (lngLat: LngLat, radius: number): Polygon => {
    const lu: LngLat = [
      WGS84.destination(lngLat, 225, radius).coordinates[0],
      WGS84.destination(lngLat, 225, radius).coordinates[1],
    ];
    const lo: LngLat = [
      WGS84.destination(lngLat, 315, radius).coordinates[0],
      WGS84.destination(lngLat, 315, radius).coordinates[1],
    ];
    const ro: LngLat = [
      WGS84.destination(lngLat, 45, radius).coordinates[0],
      WGS84.destination(lngLat, 45, radius).coordinates[1],
    ];
    const ru: LngLat = [
      WGS84.destination(lngLat, 135, radius).coordinates[0],
      WGS84.destination(lngLat, 135, radius).coordinates[1],
    ];
    return [lu, lo, ro, ru];
  };

  static bboxToPolynom = (lngLat: LngLat, radius: number): Polygon => {
    const box = WGS84.pointToBbox(lngLat, radius);
    return [...box, box[0]];
  };

  static bbox = (lngLat: LngLat, radius: number): string => {
    const lu: LngLat = [
      WGS84.destination(lngLat, 225, radius).coordinates[0],
      WGS84.destination(lngLat, 225, radius).coordinates[1],
    ];
    const ro: LngLat = [
      WGS84.destination(lngLat, 45, radius).coordinates[0],
      WGS84.destination(lngLat, 45, radius).coordinates[1],
    ];
    return `${lu[0]} ${lu[1]} ${ro[0]} ${ro[1]}`;
  }

// https://www.orchids.de/haynold/koordinatenermittler/
  /* Copyright (c) 2006, HELMUT H. HEIMEIER
     Permission is hereby granted, free of charge, to any person obtaining a
     copy of this software and associated documentation files (the "Software"),
     to deal in the Software without restriction, including without limitation
     the rights to use, copy, modify, merge, publish, distribute, sublicense,
     and/or sell copies of the Software, and to permit persons to whom the
     Software is furnished to do so, subject to the following conditions:
     The above copyright notice and this permission notice shall be included
     in all copies or substantial portions of the Software.*/
  
  /* Die Funktion verschiebt das Kartenbezugssystem (map datum) vom
     WGS84 Datum (World Geodetic System 84) zum in Deutschland
     gebr??uchlichen Potsdam-Datum. Geographische L??nge lw und Breite
     bw gemessen in grad auf dem WGS84 Ellipsoid m??ssen
     gegeben sein. Ausgegeben werden geographische L??nge lp
     und Breite bp (in grad) auf dem Bessel-Ellipsoid.
     Bei der Transformation werden die Ellipsoidachsen parallel
     verschoben um dx = -587 m, dy = -16 m und dz = -393 m.
     Fehler berichten Sie bitte an Helmut.Heimeier@t-online.de*/
  
  // Geographische L??nge lw und Breite bw im WGS84 Datum
  static wgs2pot = (lngLat: LngLat) => {

    const [lw, bw] = lngLat;
    const DEG2RAD = Math.PI / 180.0;
    // Quellsystem WGS 84 Datum
    // Abplattung fq
    const fq = 3.35281066e-3;
    // Zielsystem Potsdam Datum
    // Abplattung f
    const f = fq - 1.003748e-5
    // Quadrat der ersten numerischen Exzentrizit??t in Quell- und Zielsystem
    const e2q = (2 * fq - fq * fq);
    const e2 = (2 * f - f * f);
    // Breite und L??nge in Radianten
    const b1 = bw * DEG2RAD;
    const l1 = lw * DEG2RAD;
    // Querkr??mmungshalbmesser nd
    const nd = WGS84.SEMI_MAJOR_AXIS / Math.sqrt(1 - e2q * Math.sin(b1) * Math.sin(b1));
    // Kartesische Koordinaten des Quellsystems WGS84
    const xw = nd * Math.cos(b1) * Math.cos(l1);
    const yw = nd * Math.cos(b1) * Math.sin(l1);
    const zw = (1 - e2q) * nd * Math.sin(b1);
    // Kartesische Koordinaten des Zielsystems (datum shift) Potsdam
    const x = xw - 587;
    const y = yw - 16;
    const z = zw - 393;
    // Berechnung von Breite und L??nge im Zielsystem
    const rb = Math.sqrt(x * x + y * y);
    const bp = Math.atan(z / rb / (1 - e2)) / DEG2RAD;
  
    let lp = 0;
    if (x > 0)
       lp = Math.atan(y/x) / DEG2RAD;
    if (x < 0 && y > 0)
       lp = Math.atan(y/x) / DEG2RAD + 180;
    if (x < 0 && y < 0)
       lp = Math.atan(y/x) / DEG2RAD - 180;
  
    return [lp, bp];
  }


/* Copyright (c) 2006, HELMUT H. HEIMEIER
   Permission is hereby granted, free of charge, to any person obtaining a
   copy of this software and associated documentation files (the "Software"),
   to deal in the Software without restriction, including without limitation
   the rights to use, copy, modify, merge, publish, distribute, sublicense,
   and/or sell copies of the Software, and to permit persons to whom the
   Software is furnished to do so, subject to the following conditions:
   The above copyright notice and this permission notice shall be included
   in all copies or substantial portions of the Software.*/

/* Die Funktion wandelt geographische Koordinaten in GK Koordinaten
   um. Geographische L??nge lp und Breite bp m??ssen im Potsdam Datum
   gegeben sein. Berechnet werden Rechtswert rw und Hochwert hw.*/

// Geographische L??nge lp und Breite bp im Potsdam Datum
static pot2gk = ([lp, bp]:number[]):string[] | undefined => {
  const DEG2RAD = Math.PI / 180.0;
  // Grenzen des Gauss-Kr??ger-Systems f??r Deutschland 46?? N < bp < 55?? N,
  //                                                   5?? E < lp < 16?? E
  if (bp < 46 || bp > 56 || lp < 5 || lp > 16) return undefined;
  // Potsdam Datum
  // Gro??e Halbachse a und Abplattung f
  const a = 6377397.155;
  const f = 3.34277321e-3;
  // Polkr??mmungshalbmesser c
  const c = a / (1 - f);
  // Quadrat der zweiten numerischen Exzentrizit??t
  const ex2 = (2 * f - f * f) / ((1 - f) * (1 - f));
  const ex4 = ex2 * ex2;
  const ex6 = ex4 * ex2;
  const ex8 = ex4 * ex4;
  // Koeffizienten zur Berechnung der Meridianbogenl??nge
  const e0 = c * DEG2RAD * (1 - 3 * ex2 / 4 + 45 * ex4 / 64 - 175 * ex6 / 256 + 11025 * ex8 / 16384);
  const e2 = c * (-3 * ex2 / 8 + 15 * ex4 / 32 - 525 * ex6 / 1024 + 2205 * ex8 / 4096);
  const e4 = c * (15 * ex4 / 256 - 105 * ex6 / 1024 + 2205 * ex8 / 16384);
  const e6 = c * (-35 * ex6 / 3072 + 315 * ex8 / 12288);
  // Breite in Radianten
  const br = bp * DEG2RAD;
  const tan1 = Math.tan(br);
  const tan2 = tan1 * tan1;
  const tan4 = tan2 * tan2;
  const cos1 = Math.cos(br);
  const cos2 = cos1 * cos1;
  const cos4 = cos2 * cos2;
  const cos3 = cos2 * cos1;
  const cos5 = cos4 * cos1;
  const etasq = ex2 * cos2;
  // Querkr??mmungshalbmesser nd
  const nd = c / Math.sqrt(1 + etasq);
  // Meridianbogenl??nge g aus gegebener geographischer Breite bp
  const g = e0 * bp + e2 * Math.sin(2 * br) + e4 * Math.sin(4 * br) + e6 * Math.sin(6 * br);
  // L??ngendifferenz dl zum Bezugsmeridian lh
  const kz = Math.floor((lp + 1.5) / 3);
  const lh = kz * 3;
  const dl = (lp - lh) * DEG2RAD;
  const dl2 = dl * dl;
  const dl4 = dl2 * dl2;
  const dl3 = dl2 * dl;
  const dl5 = dl4 * dl;
  // Hochwert hw und Rechtswert rw als Funktion von geographischer Breite und L??nge
  const hw = g + (nd * cos2 * tan1 * dl2) / 2 +
    (nd * cos4 * tan1 * (5 - tan2 + 9 * etasq) * dl4) / 24;
  const rw = nd * cos1 * dl + (nd * cos3 * (1 - tan2 + etasq) * dl3) / 6 +
    (nd * cos5 * (5 - 18 * tan2 + tan4) * dl5) / 120 + kz * 1e6 + 500000;
	
	return [rw.toFixed(3), hw.toFixed(3)];
}


  static pot2tkq = ([lp, bp]:number[]) => {

    console.log([lp, bp]);
    //TK
    const tkv = Math.floor(560 - (bp * 10.0));
    const tkh = Math.floor((lp * 6.0) - 34);
    const tk = tkv * 100 + tkh;
    return tk.toString().padStart(4, '0');

  }

  static pot2MTBQQQ = ([lp, bp]:number[]):string[] => {
    // Quadrant
    // erdacht in zwei Mittagspausen von B. Haynold
    let q1 = Math.floor(lp * 12.0) % 2;
    let q2 = Math.floor(bp * 20.0) % 2;
    let qqq = 100 * (q1 + (1-q2) * 2 + 1);
    // Himmelsrichtungen
    const qh = 'SN'[q2] + 'WO'[q1];
    // Quadrant des Quadrant (16tel)
    q1 = Math.floor(lp * 24.0) % 2;
    q2 = Math.floor(bp * 40.0) % 2;
    qqq += 10 * (q1 + (1-q2) * 2 + 1);
    // Quadrant des Quadrant des Quadrant (64tel)
    q1  = Math.floor(lp * 48.0) % 2;
    q2  = Math.floor(bp * 80.0) % 2;
    qqq += (q1 + (1-q2) * 2 + 1);
    return [qqq.toString(), qh];
  }  

  static pointInPolygon(lngLat: LngLat, polygon: Polygon): boolean {

    const [x, y] = lngLat;
    const len = polygon.length;
    let crossings = false;
    for ( let i = 0; i < len; i++) {
      const nextX = polygon[(i + 1) % len][0];
      const nextY = polygon[(i + 1) % len][1];
      const [tmpX1, tmpX2] = polygon[i][0] < nextX ? [polygon[i][0], nextX] : [nextX, polygon[i][0]];
      if (x > tmpX1 && x <= tmpX2 && (y < polygon[i][1] || y <= nextY)) {
        const dx = nextX - polygon[i][0];
        const dy = nextY - polygon[i][1];
        const eps = 0.000001;
        let k = Number.MAX_SAFE_INTEGER / 180;
        if (Math.abs(dx) >= eps) k = dy / dx;
        const m = polygon[i][1] - k * polygon[i][0];
        const y2 = k * x + m;
        if (y <= y2) crossings = !crossings;
      }
    }
    return crossings;
  }

  static intersectionLines = (p0: LngLat, p1: LngLat, p2: LngLat, p3: LngLat): boolean => {
    const s10_x = p1[0] - p0[0];
    const s10_y = p1[1] - p0[1];
    const s32_x = p3[0] - p2[0];
    const s32_y = p3[1] - p2[1];
    const denom = s10_x * s32_y - s32_x * s10_y;
    if(denom === 0) return false;
    const denom_positive = denom > 0;
    const s02_x = p0[0] - p2[0];
    const s02_y = p0[1] - p2[1];
    const s_numer = s10_x * s02_y - s10_y * s02_x;
    if((s_numer < 0) === denom_positive) return false;
    const t_numer = s32_x * s02_y - s32_y * s02_x;
    if((t_numer < 0) === denom_positive) return false;
    if((s_numer > denom) === denom_positive || (t_numer > denom) === denom_positive) return false;
    /*
    const t = t_numer / denom;
    const p = {x: p0[0] + (t * s10_x), y: p0[1] + (t * s10_y)}; */
    return true;
  }

  static intersectionOfPolygons = (polygon1: Polygon, polygon2: Polygon): boolean => {
    if (WGS84.pointInPolygon(WGS84.medianBox(polygon1),polygon2)) return true;
    if (WGS84.pointInPolygon(WGS84.medianBox(polygon2),polygon1)) return true;
    if (WGS84.polygonBorderOverlap(polygon2, polygon1)) return true;
    return false;
  }

  static polygonBorderOverlap = (polygon1: Polygon, polygon2: Polygon): boolean => {
    for (let i = 0; i < polygon1.length; i++) {
      for (let j = 0; j < polygon2.length; j++) {
        const p0 = polygon1[i];
        const p1 = polygon1[(i + 1) % polygon1.length];
        const p2 = polygon2[j];
        const p3 = polygon2[(j + 1) % polygon2.length];
        if(WGS84.intersectionLines(p0,p1,p2,p3)) return true;
      }
    }
    return false;
  }

  static medianBox = (polygon: Polygon): LngLat => {
    const sum = polygon.reduce((a,b) => [b[0]+a[0],b[1]+a[1]],[0,0]);
    return sum.map(a => a/polygon.length) as LngLat;
  }

  static polygonStringToNumber(polygon: string): Polygon {
    const polygonStr = polygon.replaceAll(/[POLYGON()]/gi,'');
    return polygonStr.split(',').map(p => p.trim().split(' ')).map(p => [parseFloat(p[0]),parseFloat(p[1])]);
  }

}



export interface Point {
  coordinates: LngLat
}
export type LngLat = [number, number];
export type Polygon = LngLat[];