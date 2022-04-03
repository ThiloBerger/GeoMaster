import osmtogeojson from 'osmtogeojson';

import { Fill, Stroke, Style, Circle } from 'ol/style';
import Map from 'ol/Map';
import { OSM, Vector as VectorSource} from 'ol/source';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import View from 'ol/View';
import {fromLonLat} from 'ol/proj';
import GeoJSON from 'ol/format/GeoJSON';
import { getOverpass } from './service/api';

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
    const drawGeoJson = (geojsonObject: any) => {
     
      let source = new VectorSource({
        features: new GeoJSON().readFeatures(geojsonObject, {
          featureProjection: map.getView().getProjection()
        }),

      });
  
      var layer = new VectorLayer({
        source: source,
        style: this.styles
      });
  
      map.addLayer(layer);
  }
  getOverpass('14713000').then(data => {
    console.log(osmtogeojson(data));
    drawGeoJson(osmtogeojson(data));
  });

  }


}