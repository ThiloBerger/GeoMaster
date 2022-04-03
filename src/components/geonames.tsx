import { Accordion, AccordionSummary, AccordionDetails, ToggleButtonGroup, ToggleButton, Badge } from '@mui/material';
import { COUNTRIES_DB_DE } from '../interfaces/sprachen';
import { DbPediaInfo } from '../interfaces/dbpediaJson';
import { ExpandMore, GpsFixed, Hive, Language, Search }from '@mui/icons-material';
import { Fragment, FunctionComponent, MouseEvent, ReactElement, useEffect, useState } from 'react';
import { GeonameById, GeonamesSearchItem } from '../interfaces/geonamesSearch';
import { GeonamesMaps, GeonamesPosition } from './GovPosition';
import { getDbPedia, getGeonamesChildren, getGeonamesEntity, getGeonamesSearch, getOverpass } from '../service/api';
import { HREF } from './piglets/Link';
import { Lang } from '../types/lang';
import { ListID } from '../interfaces/listID';
import { LngLat } from '../util/WGS84';
import { OverpassItem } from '../interfaces/overpass';
import { PanelProps } from '../interfaces/panelProps';
import { SearchList } from './piglets/SearchList';

import './geonames.scss';


export const Geonames: FunctionComponent<PanelProps> = ({
  style,
  lang = Lang.DE,
  searchIds,
  openPopup = () => {},
  onSearchIds,
}): ReactElement => {

  const [geonamesSearchEntities, setGeonamesSearchEntities] = useState<GeonamesSearchItem[]>([]);
  const [geonamesEntity, setGeonamesEntity] = useState<GeonameById>();
  const [geonamesChildren, setGeonamesChildren] = useState<GeonamesSearchItem[]>([]);
  const [geonamesPos, setGeonamesPos] = useState<ReactElement>(<></>);
  const [overpass, setOverpass] = useState<OverpassItem>();
  const [dbPedia, setDbPedia] = useState<DbPediaInfo[]>([]);
  const [option, setOption] = useState(() => ['']);

  useEffect(() => {
    
    if (searchIds.geonames.apiCall || searchIds.geonames.id === '') return;
    console.log('Geonames USEEFFECT: ', searchIds.geonames.id);
    searchIds.geonames.apiCall = true;
    searchIds.geonames.status = true;
    onSearchIds({...searchIds});
 

    setGeonamesEntity(undefined);
    setGeonamesChildren([]);
    setGeonamesPos(<></>);
    setOverpass(undefined);
    setDbPedia([]);


    getGeonamesEntity(searchIds.geonames.id, lang).then(async (result) => {
      console.log('Geonames USEEFFECT 1: ',result);
      const data = result;
      data.alternateNames = result.alternateNames.filter(f => f.lang && (f.lang.length === 2 || f.lang.length === 3) );
      //data.alternateNames.forEach(s => console.log('Names: ', s.name, ' Lang: ', s.lang, ' Sprache: ', COUNTRIES_DB_DE.find(el => s.lang.toLowerCase() === el.iso639)?.sprache));
      setGeonamesEntity(data);
      setGeonamesPos(GeonamesPosition(data));

      if (searchIds.slub.id === '' && data.lat) {
        const lon = parseFloat(data.lng);
        const lat = parseFloat(data.lat);
        const lngLat: LngLat = [lon, lat];
        searchIds.slub.id = JSON.stringify(lngLat);
        onSearchIds({...searchIds});
      }

      setOverpass(undefined);
      if (data.adminCode4 && data.adminCode4.length === 8 && /^\d+$/.test(data.adminCode4)) {
        await getOverpass(data.adminCode4).then(async (result) => {
          const data = result.elements.filter(f => f.type === 'relation');
          console.log('OVERPASS: ', data);
          setOverpass(data[0]);
          if (searchIds.wikidata.id === '' && data[0].tags.wikidata) {
            searchIds.wikidata.id = data[0].tags.wikidata;
            onSearchIds({...searchIds});
          }
          if (data[0].tags['de:amtlicher_gemeindeschluessel']) {
            getDbPedia(data[0].tags['de:amtlicher_gemeindeschluessel']).then(data => {
              setDbPedia(data.results.bindings);
            })
          }
        })
      }
      searchIds.geonames.status = false;
      onSearchIds({...searchIds});
    });
    getGeonamesChildren(searchIds.geonames.id, lang).then(async (data) => {
      console.log('Geonames USEEFFECT 2: ',data.geonames);
      setGeonamesChildren(data.geonames)
    });
    
  }, [searchIds, openPopup, onSearchIds, lang]);

  const onChangeSearchHandler = (text: string) => {
    if (text !== "")
      setTimeout(() => {
        getGeonamesSearch(text, lang, option).then((data) => {
          setGeonamesSearchEntities(data.geonames);
        });
      }, 50);
    else setGeonamesSearchEntities([]);
  };

  const onClickSearch = (id: string) => {
    const newListId = new ListID();
    newListId.geonames.id = id;
    onSearchIds(newListId);
  };

  const overpassLen = (overpass: OverpassItem): number => {
    if (!overpass.tags) return 0;
    const arr  = [
      overpass.tags['contact:website'],
      overpass.tags['de:amtlicher_gemeindeschluessel'],
      overpass.tags['de:regionalschluessel'],
      overpass.tags.nickname,
      overpass.tags['note:de'],
      overpass.tags.official_name,
      overpass.tags.population,
      overpass.tags.wikidata
    ];
    return arr.reduce((sum, a) => sum + (a === undefined ? 0 : 1), 0);
  }

  const handleOption = ( event: MouseEvent<HTMLElement>, newOption: string[] ) => setOption(newOption);

  return (
    <div className='geonames panel' style={style}>

      <SearchList label='Geonames Suche' onChangeSearch={onChangeSearchHandler} onClickSearch={onClickSearch}
       getDescription={item => item.countryName} getId={item => item.geonameId.toString()} getTitle={item => item.name} items={geonamesSearchEntities} />

      <ToggleButtonGroup exclusive
        value={option}
        onChange={handleOption}
        color="primary"
        aria-label="Region"
        className='region'
      >
        <ToggleButton value="DE" aria-label="Deutschland">DE</ToggleButton>
        <ToggleButton value="EU" aria-label="Europa">EU</ToggleButton>
      </ToggleButtonGroup>


      <h3>geonames.org<br />
        <span>The GeoNames Geographical Database</span>
      </h3>
      {searchIds.geonames.id !== '' && (
        <Fragment>
          <p>
            <strong>Geonames ID: </strong>
            <HREF link={`https://www.geonames.org/${searchIds.geonames.id}`} text={searchIds.geonames.id}/>
          </p>

          {geonamesEntity && (geonamesEntity.lat || geonamesEntity.srtm3) && (
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMore />}
                className='accordionSum'
              >
                <GpsFixed /><span>Geografische Informationen</span>
              </AccordionSummary>
              <AccordionDetails className='geo'>
                {geonamesEntity.srtm3 && <p>Höhe: {geonamesEntity.srtm3} m</p>}
                {geonamesEntity.timezone && <p>Zeitzone: {geonamesEntity.timezone.timeZoneId}, Sommer: {geonamesEntity.timezone.dstOffset}, Winter: {geonamesEntity.timezone.gmtOffset}</p>}
                {geonamesPos}
                <GeonamesMaps entity={geonamesEntity} openPopup={openPopup} />
              </AccordionDetails>
            </Accordion>
          )}

          {geonamesChildren && geonamesChildren.length > 0 && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />} className='accordionSum' >
                <Badge badgeContent={geonamesChildren.length} color="primary"><Hive /></Badge>
                <span>Stadtteile</span>
              </AccordionSummary>
              <AccordionDetails className='children'>
                <p className='alternate'>
                  {geonamesChildren.map((s, i) => <em key={`children${i}`}>{s.name}</em>)}
                </p>
              </AccordionDetails>
            </Accordion>
          )}

          {geonamesEntity && geonamesEntity.alternateNames && geonamesEntity.alternateNames.length > 0 && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />} className='accordionSum' >
                <Badge badgeContent={geonamesEntity.alternateNames.length} color="primary"><Language /></Badge>
                <span>Name in anderen Sprachen</span>
              </AccordionSummary>
              <AccordionDetails className='names'>
                <div className='tablelist'>
                  { geonamesEntity.alternateNames.map((s, i) => 
                    <p key={`nameslang${i}`}>
                      <b>{s.name}</b>
                      <span>
                        <i>{s.lang} <em>{COUNTRIES_DB_DE.find(el => s.lang.toLowerCase() === el.iso639)?.sprache}</em></i>
                      </span>
                    </p>
                  )}
                </div>
              </AccordionDetails>
            </Accordion>
          )}

          {overpass && overpassLen(overpass) > 0 && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />} className='accordionSum' >
                <Badge badgeContent={overpassLen(overpass)} color="primary"><Search /></Badge>
                <span>overpass-api.de</span>
              </AccordionSummary>
              <AccordionDetails className='overpass'>
                <div className='tablelist'>
                  {overpass.tags['contact:website'] && <p><b>Website</b><span>{overpass.tags['contact:website']}</span></p>}
                  {overpass.tags['de:amtlicher_gemeindeschluessel'] && <p><b>amtlicher Gemeindeschlüssel</b><span>{overpass.tags['de:amtlicher_gemeindeschluessel']}</span></p>}
                  {overpass.tags['de:regionalschluessel'] && <p><b>Regionalschlüssel</b><span>{overpass.tags['de:regionalschluessel']}</span></p>}
                  {overpass.tags.nickname && <p><b>Alias</b><span>{overpass.tags.nickname}</span></p>}
                  {overpass.tags['note:de'] && <p><b>Notiz</b><span>{overpass.tags['note:de']}</span></p>}
                  {overpass.tags.official_name && <p><b>offizieler Name</b><span>{overpass.tags.official_name}</span></p>}
                  {overpass.tags.population && <p><b>Einwohner</b><span>{overpass.tags.population}</span></p>}
                  {overpass.tags.wikidata && <p><b>Wikidata ID</b><span>{overpass.tags.wikidata}</span></p>}
                </div>
              </AccordionDetails>
            </Accordion>
          )}

          {dbPedia.length > 0 && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />} className='accordionSum' >
                <Badge badgeContent={dbPedia.length} color="primary"><Search /></Badge>
                <span>dbpedia.org</span>
              </AccordionSummary>
              <AccordionDetails className='dbpedia'>
                  <div className='info'>
                    {dbPedia.map((info, i) => 
                      <p key={`info${i}`} className='infoentry'>
                        <strong>{info.info['xml:lang']}: </strong>
                        {info.info.value}
                      </p>
                    )}  
                  </div>
                </AccordionDetails>
            </Accordion>
          )}

          {geonamesEntity && <div className='tablelist'>
              {geonamesEntity.adminCode4 && geonamesEntity.countryCode === 'DE' &&  (
                <p><b>amtlicher Gemeindeschlüssel:</b><span>{geonamesEntity.adminCode4}</span></p>
              )}
              {geonamesEntity.adminCode3 && geonamesEntity.countryCode === 'IT' &&  (
                <p><b>ISTAT:</b><span>{geonamesEntity.adminCode3}</span></p>
              )}

              {geonamesEntity.name && (
                <p><b>Name:</b><span>{geonamesEntity.name}</span></p>
              )}

              {geonamesEntity.toponymName && (
                <p><b>Toponym Name:</b><span>{geonamesEntity.toponymName}</span></p>
              )}

              {geonamesEntity.adminName3 && (
                <p><b>vollständiger Name:</b><span>{geonamesEntity.adminName3}</span></p>
              )}              

              {geonamesEntity.adminName1 && (
                <p><b>Bundesland:</b><span>{geonamesEntity.adminName1}</span></p>
              )}

              {geonamesEntity.countryName && (
                <p><b>Land:</b><span>{geonamesEntity.countryName} ({geonamesEntity.countryCode})</span></p>
              )}

              {geonamesEntity.population !== 0 && (
                <p><b>Einwohner:</b><span>{geonamesEntity.population}</span></p>
              )}
              
              {geonamesEntity.url && (
                <p><b>wikipedia:</b><span><HREF link={geonamesEntity.url} text={''}/></span></p>
              )}

          </div>}
        </Fragment>
      )}
    </div>
  );
};
