import { Accordion, AccordionSummary, AccordionDetails, Card, CardActionArea, CardContent, CardMedia, 
  CardActions, CircularProgress, Badge } from '@mui/material';
import { AccountBalance, Castle, Church, ExpandMore, Flag, GpsFixed, InsertChart, ListAlt, SportsKabaddi,VolumeUp }from '@mui/icons-material';
import { Fragment, FunctionComponent, ReactElement, useEffect, useState } from 'react'
import { getGovSearch, getOverpassLayer, getWbSearchEntities, getWikidataArchaelog, getWikidataCityData, getWikidataCityExtra, getWikidataCityPopulation, ifExistGovId, testtest } from '../service/api';
import { GOVKEY } from '../types/govkey';
import { GOVLib, WikidataLib } from '../util/util';
import { HREF } from './piglets/Link';
import { Lang } from '../types/lang';
import { ListID } from '../interfaces/listID';
import { LngLat } from '../util/WGS84';
import Masonry from '@mui/lab/Masonry';
import osmtogeojson from 'osmtogeojson';
import { OverlayerOsm } from '../interfaces/overlayerOsm';
import { OverpassOSMLayer } from './piglets/overpassOSMLayer';
import { PanelProps } from '../interfaces/panelProps';
import { SearchList } from './piglets/SearchList';
import { Table } from '../types/table';
import { TrueDate } from '../util/TrueDate';
import { v4 as uuidv4 } from 'uuid';
import { WbSearchEntities } from '../interfaces/wbSearch';
import { WdExtraItem } from './piglets/WdExtraItem';
import { WikidataArchaelogResult, WikidataExtraResult } from '../interfaces/wikidataCityData';
import { WikidataArchealogMaps, WikidataMaps, WikiDataPosition } from './GovPosition';
import { WDPop, WikidataPopulationChart } from './WikidataPopulationChart';



import './wikidata.scss';

export const Wikidata: FunctionComponent<PanelProps> = ({
  style,
  searchIds,
  openPopup = () => {},
  lang = Lang.DE,
  onSearchIds,
}): ReactElement => {
  const [groupTable, setGroupTable] = useState<Table>([]);
  const [wdPop, setWdPop] = useState<WDPop>(JSON.parse('{}'));
  const [wbSearchEntities, setWbSearchEntities] = useState<WbSearchEntities[]>([]);
  const [wdExtra, setWdExtra] = useState<WikidataExtraResult>(JSON.parse('{}'));
  const [wdArchaelog, setWdArchaelog] = useState<WikidataArchaelogResult[]>([]);
  const [wdArchaelogStatus, setWdArchaelogStatus] = useState<boolean>(false);
  const [wdCastle, setWdCastle] = useState<WikidataArchaelogResult[]>([]);
  const [wdCastleStatus, setWdCastleStatus] = useState<boolean>(false);  
  const [wdChurch, setWdChurch] = useState<WikidataArchaelogResult[]>([]);
  const [wdChurchStatus, setWdChurchStatus] = useState<boolean>(false);
  const [wdBattle, setWdBattle] = useState<WikidataArchaelogResult[]>([]);
  const [wdBattleStatus, setWdBattleStatus] = useState<boolean>(false);   
  const [wikidataPos, setWikidataPos] = useState<ReactElement>(<></>);
  const [sessionKey, setSessionKey] = useState<string>(uuidv4())
  const [osmLayer, setOsmLayer] = useState<OverlayerOsm>(JSON.parse('{}'));
  const [unique, setUnique] = useState<string>('');
  const [govLocatorId, setGovLocatorId] = useState<string>('');

  const externalRef: { [key: string]: string } = {
    Geonames: 'https://www.geonames.org/',
    getty: 'https://www.getty.edu/vow/TGNFullDisplay?find=&place=&nation=&english=Y&subjectid=',
    OSMrelation: 'https://www.openstreetmap.org/relation/',
    topostext: 'https://topostext.org/place/',
    GND: 'https://d-nb.info/gnd/',
    archINFORM: 'https://deu.archinform.net/ort/',
    GOV: 'http://gov.genealogy.net/item/show/',
    HDS_ID: 'https://hls-dhs-dss.ch/de/articles/',
  };

  useEffect(() => {
      
    if (searchIds.wikidata.apiCall || searchIds.wikidata.id === '') return;
    console.log('Wikidata USEEFFECT: ', searchIds.wikidata.id);
    searchIds.wikidata.apiCall = true;
    searchIds.wikidata.status = true;
    onSearchIds({...searchIds});

    setWdPop(JSON.parse('{}'));
    setOsmLayer(JSON.parse('{}'));
    setUnique(uuidv4());
    setWdArchaelog([]);
    setWdCastle([]);
    setWdChurch([]);
    setWdBattle([]);
    setGovLocatorId('');

    testtest().then(data => console.log('testtest', data))

    const table: Table = [];
    const readId = async (from: GOVKEY, id: string) => {
      await getGovSearch(from, id).then((response) => {
        const govId = response.url.replaceAll(/^(.*\/)/g, '');
        if (govId !== 'extended') {
          searchIds.gov.id = govId;
          onSearchIds({...searchIds});
        }
      });
    };

    getWikidataCityData(searchIds.wikidata.id, lang).then(async (data) => {
      const results = data.results.bindings;
      results.forEach((item) => {
        const group = item.x ? item.x.value : '';
        const idx = table.findIndex((item) => item.group === group);
        const lid = item.lid !== undefined;
        const prop = item.property !== undefined;
        if (idx === -1) {
          table.push({ group: group, items: [item], lid: lid, prop: prop });
        } else table[idx].items.push(item);
        if (item.ab)
          item.ab.value = item.ab.value
            .replaceAll(/(\d{4})-(\d{2})-(\d{2})(.*)/g, '$3.$2.$1')
            .replaceAll(/(01\.01\.)/g, '');
        if (item.bis)
          item.bis.value = item.bis.value
            .replaceAll(/(\d{4})-(\d{2})-(\d{2})(.*)/g, '$3.$2.$1')
            .replaceAll(/(01\.01\.)/g, '');
        delete item.x;

        if (searchIds.gov.id === '' && lid && group === 'GOV') {
          searchIds.gov.id = item.lid.value;
          onSearchIds({...searchIds});
        }

        if (lid && group === 'GND' && searchIds.lobid.id === '') {
          searchIds.lobid.id = item.lid.value;
          onSearchIds({...searchIds});
        }

        if (lid && group === 'getty' && searchIds.getty.id === '') {
          searchIds.getty.id = item.lid.value;
          onSearchIds({...searchIds});
        }
        
        if (lid && group === 'Geonames' && searchIds.geonames.id === '') {
          searchIds.geonames.id = item.lid.value;
          onSearchIds({...searchIds});
        }  
      });

      setGroupTable(table);
      console.log('Wikidata USEEFFECT 1: ', table);

      if (searchIds.gov.id === '')
        readId(GOVKEY.Wikidata, searchIds.wikidata.id);

      if (searchIds.gov.id === '') {
        const idx = table.findIndex(item => item.group === 'SIMC' && item.lid);
        if (idx !== -1) readId(GOVKEY.SIMC, table[idx].items[0].lid.value);
      }        
      if (searchIds.gov.id === '') {
        const idx = table.findIndex(item => item.group === 'Geonames' && item.lid);
        if (idx !== -1) readId(GOVKEY.GeoNames, table[idx].items[0].lid.value);
      }
      if (searchIds.gov.id === '') {
        const idx = table.findIndex(item => item.group === 'NUTS' && item.lid);
        if (idx !== -1) readId(GOVKEY.NUTS2003, table[idx].items[0].lid.value);
      }
      if (searchIds.gov.id === '') {
        const idx = table.findIndex(item => item.group === 'NUTS' && item.lid);
        if (idx !== -1) readId(GOVKEY.NUTS1999, table[idx].items[0].lid.value);
      }

        searchIds.wikidata.status = false;
        onSearchIds({...searchIds});

    });

    getWikidataCityPopulation(searchIds.wikidata.id).then(async (data) => {
      const results = data.results.bindings;
      console.log('Wikidata USEEFFECT: 2',results);
      if (results.length !== 0 && results[0].population) {
        setWdPop(WikidataPopulationChart(results));
      }
    });    

    getWikidataCityExtra(searchIds.wikidata.id, lang).then(async (data) => {
      setSessionKey(uuidv4());
      let extraTmp = data.results.bindings;
      let extra: WikidataExtraResult = {...extraTmp[0]};
      if (extraTmp.length > 1) {
        extraTmp = extraTmp.filter((f) => f.lat);
        if (extraTmp.length > 0) extra = extraTmp[0];
      }

      console.log('Wikidata USEEFFECT: 3',data.results);
      console.log('Wikidata USEEFFECT: 3',extra);
      setWdExtra(extra);
      setWikidataPos(WikiDataPosition(extra));

      if (extra.lat) {
        const lon = parseFloat(extra.lon.value);
        const lat = parseFloat(extra.lat.value);
        const lngLat: LngLat = [lon, lat];

        // exisiert berechnete GOV ID?
        const govSolvedId = GOVLib.getGovLocatorId(extra.ort.value, lngLat);
        ifExistGovId(govSolvedId).then(response => {
          const test = response.url.replaceAll(/^(.*\/)/g, '');
          setGovLocatorId(test === govSolvedId ? response.url : '');
        });

        getOverpassLayer(searchIds.wikidata.id, lngLat).then(data => {
          console.log('Wikidata Overpass:', data);
          const json = osmtogeojson(data);
          console.log('Wikidata Overpass JSON :', json);
          setOsmLayer({data: data, logLat: lngLat});
        });

        setWdArchaelogStatus(true);
        getWikidataArchaelog(lang, lngLat, 25).then(data => {
          console.log('Wikidata Archaelog:', data);
          setWdArchaelogStatus(false);
          setWdArchaelog(data.results.bindings);
        }).catch (
          err => setWdArchaelogStatus(false)
        );

        setWdCastleStatus(true);
        getWikidataArchaelog(lang, lngLat, 25, 'Q23413').then(data => {
          console.log('Wikidata Castle:', data);
          setWdCastleStatus(false);
          setWdCastle(data.results.bindings);
        }).catch (
          err => setWdCastleStatus(false)
        );

        setWdChurchStatus(true);
        getWikidataArchaelog(lang, lngLat, 25, 'Q16970').then(data => {
          console.log('Wikidata Church:', data);
          setWdChurchStatus(false);
          setWdChurch(data.results.bindings);
        }).catch (
          err => setWdChurchStatus(false)
        );     
        
        setWdBattleStatus(true); //Q13418847 historisches Ereignis
        getWikidataArchaelog(lang, lngLat, 40, 'Q178561').then(data => {
          console.log('Wikidata Battle:', data);
          setWdBattleStatus(false);
          setWdBattle(data.results.bindings);
        }).catch (
          err => setWdBattleStatus(false)
        );           

        if (searchIds.slub.id === "") {
          searchIds.slub.id = JSON.stringify(lngLat);
          onSearchIds({ ...searchIds });
        }
      }

    });

  }, [lang, onSearchIds, searchIds]);

  const onChangeSearchHandler = (text: string) => {
    if (text !== "")
      getWbSearchEntities(text, lang, 20).then((data) =>
        setWbSearchEntities(data.search)
      );
    else setWbSearchEntities([]);
  };

  const onClickSearch = (id: string) => {
    const newListId = new ListID();
    newListId.wikidata.id = id;
    onSearchIds(newListId);
  };

  return (
    <div className='wikidata panel' style={style}>

      <SearchList label='WikiData Suche' onChangeSearch={onChangeSearchHandler} onClickSearch={onClickSearch}
       getDescription={item => item.description} getId={item => item.id} getTitle={item => item.label} items={wbSearchEntities} />

      <h3>Wikidata.org<br /><span>Die freie Wissensdatenbank</span></h3>
      {searchIds.wikidata.id !== '' && (
        <Fragment>
          <p>
            <strong>Wikidata ID: </strong>
            <HREF link={`https://www.wikidata.org/wiki/${searchIds.wikidata.id}`} text={searchIds.wikidata.id}/>
          </p>

          {osmLayer.data && osmLayer.data.elements.length > 0 && <OverpassOSMLayer data={osmLayer} />}

          {wdPop.chart && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />} className='accordionSum' >
                <Badge badgeContent={wdPop.total} color="primary"><InsertChart /></Badge>
                <span>Einwohner</span>
              </AccordionSummary>
              <AccordionDetails>{wdPop.chart}</AccordionDetails>
            </Accordion>
          )}

          {(wdExtra && (wdExtra.area || wdExtra.lat || wdExtra.mapDetailLabel || wdExtra.mapLabel || wdExtra.height || wdExtra.time)) && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />} className='accordionSum' >
                <GpsFixed /><span>Geografische Informationen</span>
              </AccordionSummary>
              <AccordionDetails className='geo'>
                {wdExtra.area && <p>Fläche: {wdExtra.area.value} km<sup>2</sup> {wdPop.last && wdPop.last > 0 && <>≙ {Math.floor(wdPop.last/parseFloat(wdExtra.area.value))} Einwohner/km<sup>2</sup></>}</p>}
                {wdExtra.height && <p>Höhe: {wdExtra.height.value} m</p>}
                {wdExtra.time && wdExtra.time.value.split('; ').map((s, i) => <p key={unique+i}>
                  {wdExtra.timename.value.split('; ')[i]}: {s}
                </p> )}                
                {wikidataPos}
                <WikidataMaps entity={wdExtra} openPopup={openPopup}/>
                <div className='flexgap'>
                  <WdExtraItem item={wdExtra.mapLabel} label='Karte' openPopup={openPopup}/>
                  <WdExtraItem item={wdExtra.mapDetailLabel} label='Detailkarte' openPopup={openPopup}/>
                  <WdExtraItem item={wdExtra.mapLocationLabel} label='Locationskarte' openPopup={openPopup}/>
                </div>
              </AccordionDetails>
            </Accordion>
          )}


          {(wdExtra && (wdExtra.logoLabel || wdExtra.imgLabel || wdExtra.flagLabel || wdExtra.armsLabel || wdExtra.sealLabel )) && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />} className='accordionSum' >
                <Flag /><span>Wappen / Logos etc.pp.</span>
              </AccordionSummary>
              <AccordionDetails className='flag'>
                <WdExtraItem item={wdExtra.logoLabel} label='Logo' openPopup={openPopup}/>
                <WdExtraItem item={wdExtra.imgLabel} label='Bild' openPopup={openPopup}/>
                <WdExtraItem item={wdExtra.flagLabel} label='Flagge' openPopup={openPopup}/>
                <WdExtraItem item={wdExtra.armsLabel} label='Wappen' openPopup={openPopup}/>
                <WdExtraItem item={wdExtra.sealLabel} label='Siegel' openPopup={openPopup}/>
              </AccordionDetails>
            </Accordion>
          )}

          {(wdExtra && wdExtra.audioLabel) && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />} className='accordionSum' >
                <VolumeUp /><span>Aussprache</span>
              </AccordionSummary>
              <AccordionDetails className='audio'>
              <audio key={sessionKey} controls>
                <source src={wdExtra.audioLabel.value} type='audio/ogg; codecs="vorbis"' data-width='0' data-height='0' data-bandwidth='125373' />
              </audio>
              </AccordionDetails>
            </Accordion>
          )}

          {wdArchaelog && ((wdArchaelog.length === 0) || !wdArchaelogStatus) &&
            <Accordion className='accordioncardhead'>
              <AccordionSummary expandIcon={<ExpandMore />} className='accordionSum' >
              <Badge badgeContent={wdArchaelog.length} color="primary"><AccountBalance /></Badge>
                <span>Nahe archälogische Orte</span>
                {wdArchaelogStatus && wdArchaelog.length === 0 &&<CircularProgress className='spinner'/>}
              </AccordionSummary>
              <AccordionDetails className='accordioncard'>
                {wdArchaelog.length !== 0 && wdArchaelog.map((a, i) => <Card key={i}>
                  <CardActionArea href={a.ort.value} target='_blank'>
                    <CardContent>
                      <h1>{a.ortLabel.value}</h1>
                        {a.imgLabel && <CardMedia
                          component="img"
                          height="180"
                          image={a.imgLabel.value+'?width=600px'}
                          alt={a.ortLabel.value}
                        />}                      
                      <p>{a.ortDescription?.value}</p>
                      <p>{a.subLabel?.value} ({a.subDescription?.value})</p>
                    </CardContent>
                  </CardActionArea>
                  <CardActions>
                    <WikidataArchealogMaps entity={a} openPopup={openPopup}/><p>{a.distNum.value.replace(/(\d+\.\d{3}).*/,'$1')} km entfernt</p>
                  </CardActions>
                </Card>)}
              </AccordionDetails>
            </Accordion>
          }

          {wdCastle && ((wdCastle.length === 0) || !wdCastleStatus) &&
            <Accordion className='accordioncardhead'>
              <AccordionSummary expandIcon={<ExpandMore />} className='accordionSum' >
                <Badge badgeContent={wdCastle.length} color="primary"><Castle /></Badge>
                <span>Nahe Burgen/Wehrbaue</span>
                {wdCastleStatus && wdCastle.length === 0 &&<CircularProgress className='spinner'/>}
              </AccordionSummary>
              <AccordionDetails className='accordioncard'>
                {wdCastle.length !== 0 && wdCastle.map((a, i) => <Card key={i}>
                  <CardActionArea href={a.ort.value} target='_blank'>
                    <CardContent>
                      <h1>{a.ortLabel.value}</h1>
                        {a.imgLabel && <CardMedia
                          component="img"
                          height="180"
                          image={a.imgLabel.value+'?width=600px'}
                          alt={a.ortLabel.value}
                        />}                      
                      <p>{a.ortDescription?.value}</p>
                      <p>{a.subLabel?.value} ({a.subDescription?.value})</p>
                    </CardContent>
                  </CardActionArea>
                  <CardActions>
                    <WikidataArchealogMaps entity={a} openPopup={openPopup}/><p>{a.distNum.value.replace(/(\d+\.\d{3}).*/,'$1')} km entfernt</p>
                  </CardActions>
                </Card>)}
              </AccordionDetails>
            </Accordion>
          }

          {wdChurch && ((wdChurch.length === 0) || !wdChurchStatus) &&
            <Accordion className='accordioncardhead'>
              <AccordionSummary expandIcon={<ExpandMore />} className='accordionSum' >
                <Badge badgeContent={wdChurch.length} color="primary"><Church /></Badge>
                <span>Nahe Kirchen/Kloster</span>
                {wdChurchStatus && wdChurch.length === 0 &&<CircularProgress className='spinner'/>}
              </AccordionSummary>
              <AccordionDetails className='accordioncard'>
                {wdChurch.length !== 0 && wdChurch.map((a, i) => <Card key={i}>
                  <CardActionArea href={a.ort.value} target='_blank'>
                    <CardContent>
                      <h1>{a.ortLabel.value}</h1>
                        {a.imgLabel && <CardMedia
                          component="img"
                          height="180"
                          image={a.imgLabel.value+'?width=600px'}
                          alt={a.ortLabel.value}
                        />}                      
                      <p>{a.ortDescription?.value}</p>
                      <p>{a.subLabel?.value} ({a.subDescription?.value})</p>
                    </CardContent>
                  </CardActionArea>
                  <CardActions>
                    <WikidataArchealogMaps entity={a} openPopup={openPopup}/><p>{a.distNum.value.replace(/(\d+\.\d{3}).*/,'$1')} km entfernt</p>
                  </CardActions>
                </Card>)}
              </AccordionDetails>
            </Accordion>
          }

          {wdBattle && ((wdBattle.length === 0) || !wdBattleStatus) &&
            <Accordion className='accordioncardhead'>
              <AccordionSummary expandIcon={<ExpandMore />} className='accordionSum' >
                <Badge badgeContent={wdBattle.length} color="primary"><SportsKabaddi /></Badge>
                <span>Nahe Schlachten</span>
                {wdBattleStatus && wdBattle.length === 0 &&<CircularProgress className='spinner'/>}
              </AccordionSummary>
              <AccordionDetails className='accordioncard'>
                {wdBattle.length !== 0 && wdBattle.map((a, i) => <Card key={i}>
                  <CardActionArea href={a.ort.value} target='_blank'>
                    <CardContent>
                      <h1>{a.ortLabel.value}</h1>
                        {a.imgLabel && <CardMedia
                          component="img"
                          height="180"
                          image={a.imgLabel.value+'?width=600px'}
                          alt={a.ortLabel.value}
                        />}                      
                      <p>{a.ortDescription?.value}{a.ab && `, ${(new TrueDate(a.ab.value)).getNormdate()}`}</p>
                      <p>{a.subLabel?.value} ({a.subDescription?.value})</p>
                    </CardContent>
                  </CardActionArea>
                  <CardActions>
                    <WikidataArchealogMaps entity={a} openPopup={openPopup}/><p>{a.distNum.value.replace(/(\d+\.\d{3}).*/,'$1')} km entfernt</p>
                  </CardActions>
                </Card>)}
              </AccordionDetails>
            </Accordion>
          }  

          {groupTable.filter(f => f.lid).length !== 0 && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />} className='accordionSum' >
                <Badge badgeContent={groupTable.filter((f) => f.lid).length} color="primary"><ListAlt /></Badge>
                <span>Externe Referenzen</span>
              </AccordionSummary>
              <AccordionDetails>
                <Masonry columns={2} spacing={2}>
                  {groupTable
                    .filter(f => f.lid)
                    .map((item, index) => (
                      <div key={`wikidata-lid-${index}`} className='list'>
                        <h1>{item.group}</h1>
                        {item.items.map((c, i) => (Array.of('NUTS', 'AGS', 'SIMC', 'LAU').includes(item.group)) 
                          ? <p key={i}>{c.lid.value}</p>
                          : <p key={`wikidata-lid-item-${i}`}>
                              <HREF link={externalRef[item.group]+c.lid.value} text={c.lid.value} />
                            </p>
                        )}
                      </div>
                  ))}
                </Masonry>
                {govLocatorId !=='' && <>
                    <hr />
                    <p><strong>GOV-ID: </strong>
                    <HREF link={govLocatorId} text={govLocatorId.replaceAll(/^(.*\/)/g, '')} />
                    <span className="small"> ... aus Name und Position berechnet</span>
                    </p>
                  </>
                }
              </AccordionDetails>
            </Accordion>
          )}

          <div className='tablelist'>
            {groupTable.filter(f => f.prop)
            .map((item, index) => (
              <p key={`wikidata-prop-${index}`}>
                <b>{item.group}</b><span>{WikidataLib.typ(item.items)}</span>
              </p>
            ))}
          </div>
        </Fragment>
      )}
    </div>
  );
};
