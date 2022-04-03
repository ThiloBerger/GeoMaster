import { Fill, Stroke, Style, Circle } from 'ol/style';
import Map from 'ol/Map';
import { OSM, Vector as VectorSource} from 'ol/source';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import View from 'ol/View';
import {fromLonLat} from 'ol/proj';
import OSMXML from 'ol/format/OSMXML';

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
    const drawPolygonOnMap = (ags: string) => {
      const xml = fetch(`http://overpass-api.de/api/interpreter?data=relation%5B%22de%3Aamtlicher%5Fgemeindeschluessel%22%3D%22${ags}%22%5D%3B%28%2E%5F%3B%3E%3B%29%3Bout%3B%0A`).then(res => res.text());
    
      let source = new VectorSource({
        features: (new OSMXML()).readFeatures(xml,{
          featureProjection: map.getView().getProjection()
        }),
      });

      var layer = new VectorLayer({
        source: source,
        style: this.styles
      });
          console.log(source.getProperties())
      map.addLayer(layer);
  }
  drawPolygonOnMap('14713000');

  }


}