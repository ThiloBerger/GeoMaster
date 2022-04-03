import { Fragment, FunctionComponent, ReactElement, useEffect, useState } from 'react';
import { Slider } from '@mui/material';
import { getGeoPortOst } from '../service/api';
import { PanelProps } from '../interfaces/panelProps';

import './slub.scss';
import { LngLat } from '../util/WGS84';
import { GeoPortJSON, GeoPortResponse } from '../interfaces/geoport';


export const GeoPortOst: FunctionComponent<PanelProps> = ({style, searchIds, onSearchIds}): ReactElement => {
    
  const [radius, setRadius] = useState<number>(2000);
  const [gpoData, setGpoData] = useState<GeoPortResponse>();
  const [mapTyp, setMapTyp] = useState<string>('');

    useEffect(() => {

      if (searchIds.geoportost.apiCall || searchIds.slub.id === '') return;
      console.log('GeoPortOst USEEFFECT: ', searchIds.slub.id)
      searchIds.geoportost.apiCall = true;
      searchIds.geoportost.status = true;
      onSearchIds({...searchIds});

      const lngLat = JSON.parse(searchIds.slub.id);

      getGeoPortOst(lngLat, radius, 1, '').then(async (response) => {
        console.log('GeoPortOst USEEFFECT: ', response)
        const data: GeoPortJSON = JSON.parse(response.contents);
        console.log('GeoPortOst USEEFFECT: ', data.response);
        setGpoData(data.response);
        searchIds.geoportost.status = false;
        onSearchIds({...searchIds});
      });
    }, [searchIds, onSearchIds, radius]);

    const refreshMaps = (page: number, typ: string) => {
      const lngLat: LngLat = JSON.parse(searchIds.slub.id);
      getGeoPortOst(lngLat, radius, page, typ).then(async (response) => {
        console.log('GeoPortOst Slider: ', response)
        const data: GeoPortJSON = JSON.parse(response.contents);
        console.log('GeoPortOst Slider: ', data.response);
        setGpoData(data.response);
      });
    }

    const sliderChange = (event: Event, newValue: number | number[]) => {
      const r = newValue as number;
      setRadius(r === 0 ? 1 : r);
    };
 
    const pageButton = (page: number): ReactElement => <button onClick={()=>refreshMaps(page, mapTyp)}>{page}</button>;

    const getPagiRange = (from: number, to:number, current: number): ReactElement[]  => {
      const pages: ReactElement[] = [];
      for (let page = from; page <= to; page++)
          pages.push(page === current ? <span>{page}</span> : pageButton(page));
      return pages;
    }

    const getPagination = (current: number, total: number): ReactElement[] => {
      if (total < 8) return getPagiRange(1, total, current);
      const pages: ReactElement[] = [];
      if (current < 5) pages.push(...getPagiRange(1, 5, current));
      else {
        pages.push(pageButton(1));
        pages.push(<span>...</span>);
        if (total - current < 4) {
          pages.push(...getPagiRange(total - 4, total, current));
          return pages;
        }
        pages.push(...getPagiRange(current - 1, current + 1, current));
      }
      pages.push(<span>...</span>);
      pages.push(pageButton(total));
      return pages;
    }

    const mapTypChange = (typ: string) => {
      setMapTyp(typ);
      refreshMaps(1, typ)
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
              {gpoData?.pages?.total_count
                ? gpoData.pages.total_count
                : "keine"}
            </p>
            <Slider
              size="small"
              defaultValue={2000}
              aria-label="Small"
              valueLabelDisplay="auto"
              min={0}
              max={20000}
              step={1000}
              onChange={sliderChange}
              onMouseUp={() => refreshMaps(1, mapTyp)}
            />

            <div className="control">
              {gpoData && gpoData.pages && gpoData.pages.total_count > 0 && (
                <div className="paginator">
                  {getPagination(
                    gpoData.pages.current_page,
                    gpoData.pages.total_pages
                  ).map((c, i) => (
                    <div key={i}>{c}</div>
                  ))}
                </div>
              )}

              <div className="select">
                {gpoData && gpoData.facets && (
                  <select
                    value={mapTyp}
                    onChange={(e) => mapTypChange(e.target.value)}
                  >
                    {" "}
                    <option key="default" value="">
                      alle Karten ({gpoData.pages.total_count}){" "}
                    </option>
                    {gpoData.facets
                      .filter((f) => f.name === "dc_type_s")[0]
                      .items.map((t, i) => (
                        <option key={i} value={t.value}>
                          {" "}
                          {t.label} ({t.hits}){" "}
                        </option>
                      ))}
                  </select>
                )}
                <div className="select_arrow"></div>
              </div>
            </div>

            {gpoData && gpoData.docs && gpoData.docs.length > 0 && (
              <ul className="map">
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
            )}
          </Fragment>
        )}
      </div>
    );

}



    





