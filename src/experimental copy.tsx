import { Fill, Stroke, Style, Circle } from 'ol/style';
import Map from 'ol/Map';
import { OSM, Vector as VectorSource} from 'ol/source';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import View from 'ol/View';
import {fromLonLat} from 'ol/proj';
import Feature from 'ol/Feature';
import Polygon from 'ol/geom/Polygon';
import { API } from './service/api';

export class variante_1 {
  fill = new Fill({
    color: "rgba(210, 122, 167,0.2)",
  });
  stroke = new Stroke({
    color: "#B40404",
    width: 4,
  });
  styles = [
    new Style({
      image: new Circle({
        fill: this.fill,
        stroke: this.stroke,
        radius: 5
      }),
      fill: this.fill,
      stroke: this.stroke
    })
  ];
  mapInit = () => {
    const LonLat = [12.33, 51.33];
    const WebMercator = fromLonLat(LonLat);
    const map = new Map({
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      target: 'map',
      view: new View({

        center: WebMercator,
        zoom: 13,
      }),
    });
    const drawPolygonOnMap = (coordinates: [number,number][][]) => {
      const polygonFeature = new Feature(
          new Polygon(coordinates).transform('EPSG:4326','EPSG:3857'));
    
      let source = new VectorSource({
        features: [polygonFeature]
      });
  
      var layer = new VectorLayer({
        source: source,
        style: this.styles
      });
  
      map.addLayer(layer);
    }

    API.getOverpass('14713000').then(data => {
      let points:[number,number][];
      points = data.elements.filter(e => e.type === 'node')
      .sort((a,b)=> a.id - b.id)
      .filter((e,i) => i === i % 70)
      .map(e => [e.lon, e.lat]);
      console.log(data.elements);


      const orientation = (p:[number,number], q:[number,number], r:[number,number]) => {
        let val = (q[0] - p[0]) * (r[1] - q[1]) - (q[1] - p[1]) * (r[0] - q[0]);
        if (val === 0) return 0; 
        return val > 0 ? 1 : 2; 
      }

      let hull: [number,number][] = [];
      const convexHull = (points:[number,number][], n: number) => {
        if (n < 3) return;
        let l = 0;
        for (let i = 1; i < n; i++) 
        if (points[i][1] < points[l][1]) l = i;
        let p = l,
          q;
        do {
          hull.push(points[p]);
          q = (p + 1) % n;

          for (let i = 0; i < n; i++) {
            if (orientation(points[p], points[i], points[q]) === 2) q = i;
          }
          p = q;
        } while (p !== l);
      }

      convexHull(points,points.length);
      hull.push(hull[0]);
      drawPolygonOnMap([hull]);

    })
  }
}