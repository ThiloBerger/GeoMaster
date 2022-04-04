import { Fragment, FunctionComponent, ReactElement, useEffect, useState } from 'react';
import { Slider } from '@mui/material';
import { API } from '../service/api';
import { Hits } from '../interfaces/maps';
import { PanelProps } from '../interfaces/panelProps';

import './slub.scss';
import { LngLat } from '../util/WGS84';


export const Slub: FunctionComponent<PanelProps> = ({style, searchIds, onSearchIds}): ReactElement => {
    
  const [radius, setRadius] = useState<number>(2000);
  const [hits, setHits] = useState<Hits>();
  const mapTyp: { [key: string]: string } = {
    AE: 'Äquidistantenkarte',
    AK: 'Anderer Altkartentyp',
    CM: 'Stadtplan',
    GL: 'Geologische Karte',
    MB: 'Meilenblatt',
    MTB: 'Meßtischblatt',
    TK: 'Karte des Deutschen Reiches',
    TKX: 'Topographische Karte',
  };

    useEffect(() => {

      if (searchIds.slub.apiCall || searchIds.slub.id === '') return;
      console.log('Slub USEEFFECT: ', searchIds.slub.id)
      searchIds.slub.apiCall = true;
      searchIds.slub.status = true;
      onSearchIds({...searchIds});

      const lngLat = JSON.parse(searchIds.slub.id);
      API.getSlubMaps(lngLat, radius).then(async (data) => {
        console.log('Slub USEEFFECT: ', data.hits)
        setHits(data.hits);

          searchIds.slub.status = false;
          onSearchIds({...searchIds});

      });
    }, [searchIds, onSearchIds, radius]);

    const handleSliderChange = (event: Event, newValue: number | number[]) => {
      const r = newValue as number;
      setRadius(r === 0 ? 1 : r);
      const lngLat: LngLat = JSON.parse(searchIds.slub.id);
      API.getSlubMaps(lngLat, radius).then(async (data) => {
        setHits(data.hits);
      });
    };


    return (
      <div className='slub panel' style={style}>
        <div className='search'>
          <p>Nach Karten wird automatisch gesucht, sobald Koordinaten vorliegen.</p>
        </div>
        <h3>
          kartenforum.slub-dresden.de
          <br />
          <span>VIRTUELES KARTENFORUM (SLUB)</span>
        </h3>
        {searchIds.slub.id !== '' && (
          <Fragment>
            <p>
              <strong>Radius: </strong>{radius} m - Karten: {hits?.total ? hits?.total : 'keine'} 
            </p>
            <Slider
              size='small'
              defaultValue={2000}
              aria-label='Small'
              valueLabelDisplay='auto'
              min={0}
              max={20000}
              step={1000}
              onChange={handleSliderChange}
            />

            {hits && hits.total > 0 && (<ul className='map'>
              {hits.hits.map((map, i) => (
                <li key={`map${i}`}>
                  <a href={`https://kartenforum.slub-dresden.de/?oid=${map._id}`} target='_blank' rel='noreferrer'>
                    <img src={map._source.thumb} alt='map' />
                    <div>
                      <h3>{map._source.title}</h3>
                      <span>{mapTyp[map._source.maptype]} - 1:{map._source.denominator} ({map._source.time.split('-')[0]})</span>
                      <p>{map._source.titlelong}</p>
                    </div>
                  </a>
                </li>
              ))}
            </ul>)}
          </Fragment>
        )}
      </div>
    );

}



    





