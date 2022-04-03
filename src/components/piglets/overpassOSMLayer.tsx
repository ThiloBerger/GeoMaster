import { Circle, Fill, Stroke, Style } from 'ol/style';
import { defaults as defaultControls, MousePosition } from 'ol/control';
import { fromLonLat } from 'ol/proj';
import GeoJSON from 'ol/format/GeoJSON';
import { FunctionComponent, ReactElement, useEffect } from 'react';
import Map from 'ol/Map';
import { OSM, Vector as VectorSource } from 'ol/source';
import osmtogeojson from 'osmtogeojson';
import { OverlayerOsm } from '../../interfaces/overlayerOsm';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { toDeg2 } from '../GovPosition';
import View from 'ol/View';
import { WGS84Point } from '../../interfaces/govRdf';


import './overpassOSMLayer.scss'

interface Props {
    data: OverlayerOsm,
}
export const OverpassOSMLayer: FunctionComponent<Props> = ({data}): ReactElement => {

  useEffect(() => {
   
    const fill = new Fill({
      color: "rgba(210, 122, 167,0.2)",
    });
    const stroke = new Stroke({
      color: "#B40404",
      width: 2,
    });
    const styles = [
      new Style({
        image: new Circle({
          fill: fill,
          stroke: stroke,
          radius: 1,
        }),
        fill: fill,
        stroke: stroke,
      }),
    ]; 

    const toGrad = (c: number[]) => {
      const point: WGS84Point = {'wgs84:lon': c[0].toString(), 'wgs84:lat': c[1].toString()};
      return toDeg2(point);
    }

    const mousePositionControl = new MousePosition({
      coordinateFormat: (coord: number[]|undefined) => coord ? toGrad(coord) : '',
      projection: 'EPSG:4326',
      className: 'custom-mouse-position',
      target: 'mouse-position',
    });

    const map = new Map({
      controls: defaultControls().extend([mousePositionControl]),
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      target: "osmmap",
      view: new View({
        center: fromLonLat([data.logLat[0],data.logLat[1]]),
        zoom: 9,
      }),
    });
    
    const json = osmtogeojson(data.data);

    const source = new VectorSource({
      features: new GeoJSON().readFeatures(json, {
        featureProjection: map.getView().getProjection(),
      }),
    });

    const layer = new VectorLayer({
      source: source,
      style: styles,
    });

    const extent = source.getExtent();
    const size = map.getSize();
    let sizeNew = [300,300]
    if (size) sizeNew = [...size.map( a => a *.8)];
    map.getView().fit(extent, {size: sizeNew, maxZoom:13})
    map.addLayer(layer);

  },[data]);

  return (<div id="osmmap" className="osmmap"><div id='mouse-position'></div></div>);
}
