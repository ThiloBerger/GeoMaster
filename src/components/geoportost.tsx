import { Fragment, FunctionComponent, ReactElement, useEffect, useRef, useState } from 'react';
import { Slider } from '@mui/material';
import { API } from '../service/api';
import { PanelProps } from '../interfaces/panelProps';

import './slub.scss';
import { LngLat, Polygon, WGS84 } from '../util/WGS84';
import { GeoPortJSON, GeoPortResponse, GeoPostOstMaps } from '../interfaces/geoport';


export const GeoPortOst: FunctionComponent<PanelProps> = ({style, searchIds, onSearchIds}): ReactElement => {
    
  const [radius, setRadius] = useState<number>(20000);
/*   const [gpoData, setGpoData] = useState<GeoPortResponse>(); */
  const [count, setCount] = useState<number>(0);
  const mapList = useRef(null);
  const [gpoMaps,setGpoMaps] = useState<GeoPostOstMaps[]>([]);
  const [gpoMapsRadius,setGpoMapsRadius] = useState<GeoPostOstMaps[]>([]);

    useEffect(() => {

      if (searchIds.geoportost.apiCall || searchIds.slub.id === '') return;
      console.log('GeoPortOst USEEFFECT: ', searchIds.slub.id)
      searchIds.geoportost.apiCall = true;
      searchIds.geoportost.status = true;
      onSearchIds({...searchIds});

      const lngLat = JSON.parse(searchIds.slub.id);


      API.getGeoPortOstTopo100000().then(async data => {
        let maps: GeoPostOstMaps[] = data.results.bindings;
        const points: LngLat[] = WGS84.perimeterSquareBox(lngLat, radius);
        console.log(points)
        const set = new Set<string>([])
        maps = maps.filter(f=>{
          if ( set.has(f.id.value) ) return false;
          set.add(f.id.value);
          return true;
        });
        setGpoMaps(maps);
        const mapsByRadius = maps.filter(map => 
          WGS84.intersectionOfPolygons(WGS84.polygonStringToNumber(map.area.value), points));
        console.log('mapsbyradius',mapsByRadius);
        setGpoMapsRadius(mapsByRadius);
        searchIds.geoportost.status = false;
        onSearchIds({...searchIds});    
      });


/*       API.getGeoPortOst(lngLat, radius).then(async response => {
        console.log('GeoPortOst USEEFFECT: ', response)
        const data: GeoPortJSON = JSON.parse(response.contents);
        console.log('GeoPortOst USEEFFECT: ', data.response);
        setCount(0);
        setGpoData(data.response);
        searchIds.geoportost.status = false;
        onSearchIds({...searchIds});          
      }); */
    }, [searchIds, onSearchIds, radius]);

    const refreshMaps = () => {
      const lngLat: LngLat = JSON.parse(searchIds.slub.id);
/*       API.getGeoPortOst(lngLat, radius).then(async (response) => {
        console.log('GeoPortOst Slider: ', response)
        const data: GeoPortJSON = JSON.parse(response.contents);
        console.log('GeoPortOst Slider: ', data.response);
        setGpoData(data.response);
      }); */
      const points: LngLat[] = WGS84.perimeterSquareBox(lngLat, radius);
      const mapsByRadius = gpoMaps.filter(map => 
        WGS84.intersectionOfPolygons(WGS84.polygonStringToNumber(map.area.value), points));
      setGpoMapsRadius(mapsByRadius);
    }

    const sliderChange = (event: Event, newValue: number | number[]) => {
      const r = newValue as number;
      setRadius(r === 0 ? 1 : r);
    };
 
    return (
      <div className="geoportost panel" style={style}>
        <div className="search">
          <p>
            Nach Karten wird automatisch gesucht, sobald Koordinaten vorliegen.
          </p>
        </div>
        <h3>
          geoportost.ios-regensburg.de
          <br />
          <span>
            Portal für thematische und versteckte Karten zu Ost- und
            Südosteuropa
          </span>
        </h3>
        {searchIds.slub.id !== "" && (
          <Fragment>
            <p>
              <strong>Radius: </strong>
              {radius} m - Karten:{" "}
              {count > 0 ? count : "keine"}
            </p>
            <Slider
              size="small"
              defaultValue={20000}
              aria-label="Small"
              valueLabelDisplay="auto"
              min={0}
              max={100000}
              step={5000}
              onChange={sliderChange}
              onMouseUp={() => refreshMaps()}
            />


            {gpoMapsRadius?.length > 0 && (
              <ul className="map" ref={mapList}>
                {gpoMapsRadius.map((map, i) => (
                  <li key={`${map.id.value}${i}`}>
                    <a href={map.url.value} target="_blank" rel="noreferrer">
                      <img
                        src={map.thumb.value}
                        alt="map"
                        onError={({ currentTarget }) => {
                          currentTarget.onerror = null;
                          const el = currentTarget.parentElement;
                          if (el) el.style.display = "none";
                        }}
                        onLoad={({ currentTarget }) => {
                          let allmaps = 0
                          if (mapList.current) allmaps = (mapList.current as HTMLElement).querySelectorAll('a[style="display: flex;"]').length;
                          setCount(allmaps);
                          const el = currentTarget.parentElement;
                          if (el) el.style.display = "flex";
                        }}
                      />
                      <div>
                        <h3>{map.title.value}</h3>
                        <span>
                          {map.typ.value} - 1:{map.scale.value}
                        </span>
                        <p>
                          {map.keywords.value}
                        </p>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            )}




{/*             {gpoData && gpoData.docs && gpoData.docs.length > 0 && (
              <ul className="map" ref={mapList}>
                {gpoData.docs.map((map, i) => (
                  <li key={`gpomap${i}`}>
                    <a href={map.bibo_uri_s} target="_blank" rel="noreferrer">
                      <img
                        src={map.thumbnail_path_ss}
                        alt="map"
                        onError={({ currentTarget }) => {
                          currentTarget.onerror = null;
                          const el = currentTarget.parentElement;
                          if (el) el.style.display = "none";
                        }}
                        onLoad={({ currentTarget }) => {
                          let allmaps = 0
                          if (mapList.current) allmaps = (mapList.current as HTMLElement).querySelectorAll('a[style="display: flex;"]').length;
                          setCount(allmaps);
                          const el = currentTarget.parentElement;
                          if (el) el.style.display = "flex";
                        }}
                      />
                      <div>
                        <h3>{map.dc_title_s}</h3>
                        <span>
                          {map.dc_type_s} - 1:{map.maps_hasScale_i}
                        </span>
                        <p>
                          {map.dct_provenance_s}, {map.dc_spatial_sm.toString()}
                        </p>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            )} */}
          </Fragment>
        )}
      </div>
    );

}



    





