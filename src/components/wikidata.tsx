import { AccountBalance, Castle, Church, ExpandMore, GpsFixed, Security, VolumeUp } from '@mui/icons-material';
import Masonry from '@mui/lab/Masonry';
import { Accordion, AccordionDetails, AccordionSummary, Badge, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import osmtogeojson from 'osmtogeojson';
import { Fragment, FunctionComponent, ReactElement, useContext, useEffect, useState } from 'react';
import { ListID } from '../interfaces/listID';
import { OverlayerOsm } from '../interfaces/overlayerOsm';
import { PanelProps } from '../interfaces/panelProps';
import { WbSearchEntities } from '../interfaces/wbSearch';
import { WikidataCardResult, WikidataExtraResult } from '../interfaces/wikidataCityData';
import { API } from '../service/api';
import { GOVKEY } from '../types/govkey';
import { Lang } from '../types/lang';
import { Table } from '../types/table';
import { TrueDate } from '../util/TrueDate';
import { WD } from '../util/util';
import { LngLat } from '../util/WGS84';
import { defaultGlobal, Global } from './Global';
import { WikidataMaps, WikiDataPosition } from './GovPosition';
import { HREF } from './piglets/Link';
import { OverpassOSMLayer } from './piglets/overpassOSMLayer';
import { SearchList } from './piglets/SearchList';
import { WdCard } from './piglets/WdCard';
import { WdExtraItem } from './piglets/WdExtraItem';
import './wikidata.scss';
import { WDPop, WikidataPopulationChart } from './WikidataPopulationChart';
import { WDPLZPop, WikidataPopulationPLZChart } from './WikidataPopulationPLZChart';


export const Wikidata: FunctionComponent<PanelProps> = ({
  style,
  searchIds,
  openPopup = () => {},
  lang = Lang.DE,
  onSearchIds,
  features,
}): ReactElement => {

  let global = useContext(Global);
  const [groupTable, setGroupTable] = useState<Table>([]);
  const [wdPop, setWdPop] = useState<WDPop>({} as WDPop);
  const [wbSearchEntities, setWbSearchEntities] = useState<WbSearchEntities[]>([]);
  const [wdExtra, setWdExtra] = useState<WikidataExtraResult>(JSON.parse('{}'));
  const [wdArchaelog, setWdArchaelog] = useState<WikidataCardResult[]>([]);
  const [wdArchaelogStatus, setWdArchaelogStatus] = useState<boolean>(false);
  const [wdCastle, setWdCastle] = useState<WikidataCardResult[]>([]);
  const [wdCastleStatus, setWdCastleStatus] = useState<boolean>(false);  
  const [wdChurch, setWdChurch] = useState<WikidataCardResult[]>([]);
  const [wdChurchStatus, setWdChurchStatus] = useState<boolean>(false);
  const [wdBattle, setWdBattle] = useState<WikidataCardResult[]>([]);
  const [wdBattleStatus, setWdBattleStatus] = useState<boolean>(false);
  const [wdDungeon, setWdDungeon] = useState<WikidataCardResult[]>([]);
  const [wdDungeonStatus, setWdDungeonStatus] = useState<boolean>(false);
  const [wdKatastroph, setWdKatastroph] = useState<WikidataCardResult[]>([]);
  const [wdKatastrophStatus, setWdKatastrophStatus] = useState<boolean>(false);
  const [wikidataPos, setWikidataPos] = useState<ReactElement>(<></>);
  const [osmLayer, setOsmLayer] = useState<OverlayerOsm>({} as OverlayerOsm);
  const [govLocatorId, setGovLocatorId] = useState<string>(''); 
  const [plzPop, setPlzPop] = useState<WDPLZPop>({} as WDPLZPop);
  const [reconci, setReconci] = useState<string|null>(null);

  const externalRef: Record<string,string> = {
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
    global.wikidata.id = searchIds.wikidata.id;
    searchIds.wikidata.apiCall = true;
    searchIds.wikidata.status = true;

    onSearchIds({...searchIds});

    setWdPop({} as WDPop);
    setOsmLayer({} as OverlayerOsm);
    setWdArchaelog([]);
    setWdCastle([]);
    setWdChurch([]);
    setWdBattle([]);
    setWdDungeon([]);
    setWdKatastroph([]);
    setGovLocatorId('');
    setPlzPop({} as WDPLZPop);

    const table: Table = [];

    API.wdCityData(searchIds.wikidata.id, lang).then(async (data) => {
      const results = data.results.bindings;
      results.forEach((item) => {
        const group = item.x ? item.x.value : '';
        const idx = table.findIndex((item) => item.group === group);
        const lid = item.lid !== undefined;
        const prop = item.property !== undefined;
        if (idx === -1) {
          table.push({ group: group, items: [item], lid: lid, prop: prop });
        } else table[idx].items.push(item);
        if (item.ab) item.ab.value = new TrueDate(item.ab.value).getNormdate();
        if (item.bis) item.bis.value = new TrueDate(item.bis.value).getNormdate();
        delete item.x;

        if (searchIds.gov.id === '' && lid && group === 'GOV') {
          searchIds.gov.id = item.lid.value;
          onSearchIds({...searchIds});
        }

        if (lid && group === 'GND' && searchIds.gnd.id === '') {
          searchIds.gnd.id = item.lid.value;
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

        if (lid && group === 'AGS' && searchIds.ags.id === '') {
          searchIds.ags.id = item.lid.value;
          onSearchIds({...searchIds});
          
          if(features) {
            const plz = features
              .filter(feat => feat.attributes.ags === item.lid.value)
              .sort((a,b) => parseInt(a.attributes.plz) - parseInt(b.attributes.plz));
            global.esri.data = plz;
            setPlzPop(WikidataPopulationPLZChart(plz));
          }
        }
      });

      global.wikidata.table = table;
      setGroupTable(table);
      console.log('Wikidata USEEFFECT 1: ', table);

      if (searchIds.gov.id === '')
        WD.readId(GOVKEY.Wikidata, searchIds.wikidata.id, searchIds, onSearchIds);

      if (searchIds.gov.id === '') {
        const idx = table.findIndex(item => item.group === 'SIMC' && item.lid);
        if (idx !== -1) WD.readId(GOVKEY.SIMC, table[idx].items[0].lid.value, searchIds, onSearchIds);
      }        
      if (searchIds.gov.id === '') {
        const idx = table.findIndex(item => item.group === 'Geonames' && item.lid);
        if (idx !== -1) WD.readId(GOVKEY.GeoNames, table[idx].items[0].lid.value, searchIds, onSearchIds);
      }
      if (searchIds.gov.id === '') {
        const idx = table.findIndex(item => item.group === 'NUTS' && item.lid);
        if (idx !== -1) WD.readId(GOVKEY.NUTS2003, table[idx].items[0].lid.value, searchIds, onSearchIds);
      }
      if (searchIds.gov.id === '') {
        const idx = table.findIndex(item => item.group === 'NUTS' && item.lid);
        if (idx !== -1) WD.readId(GOVKEY.NUTS1999, table[idx].items[0].lid.value, searchIds, onSearchIds);
      }

      searchIds.wikidata.status = false;
      onSearchIds({...searchIds});

    });

    API.wdPopulation(searchIds.wikidata.id).then(async data => {
      const results = data.results.bindings;
      console.log('Wikidata USEEFFECT: 2',results);
      if (results.length !== 0 && results[0].population) {
        global.wikidata.population = results;
        setWdPop(WikidataPopulationChart(results));
      }
    });    

    API.wdExtra(searchIds.wikidata.id, lang).then(async data => {
      let extraTmp = data.results.bindings;
      let extra: WikidataExtraResult = {...extraTmp[0]};
      if (extraTmp.length > 1) {
        extraTmp = extraTmp.filter((f) => f.lat);
        if (extraTmp.length > 0) extra = extraTmp[0];
      }

      console.log('Wikidata USEEFFECT: 3',data.results);
      console.log('Wikidata USEEFFECT: 3',extra);
      global.wikidata.extra = extra;
      setWdExtra(extra);
      setWikidataPos(WikiDataPosition(extra));

      if (extra.lat) {
        const lon = parseFloat(extra.lon.value);
        const lat = parseFloat(extra.lat.value);
        const lngLat: LngLat = [lon, lat];

        API.getOverpassLayer(searchIds.wikidata.id, lngLat).then(data => {
          console.log('Wikidata Overpass:', data);
          const json = osmtogeojson(data);
          global.overpass.geojson = json;
          console.log('Wikidata Overpass JSON :', json);
          setOsmLayer({data: data, logLat: lngLat});
        });

        WD.loadCards(setWdArchaelogStatus, setWdArchaelog, 'archaelog', 25, 'Q839954', lang, lngLat, global);
        WD.loadCards(setWdCastleStatus, setWdCastle, 'castle', 25, 'Q23413', lang, lngLat, global);
        WD.loadCards(setWdChurchStatus, setWdChurch, 'church', 25, 'Q16970', lang, lngLat, global);
        WD.loadCards(setWdBattleStatus, setWdBattle, 'battle', 40, 'Q178561', lang, lngLat, global); //Q13418847 historisches Ereignis
        WD.loadCards(setWdDungeonStatus, setWdDungeon, 'cave', 40, 'Q35509', lang, lngLat, global); 
        WD.loadCards(setWdKatastrophStatus, setWdKatastroph, 'katastrophe', 50, 'Q3839081', lang, lngLat, global);   

        if (searchIds.slub.id === '') {
          searchIds.slub.id = JSON.stringify(lngLat);
          onSearchIds({ ...searchIds });
        }

        // exisiert berechnete GOV ID?
        WD.testGovId(extra, lngLat, searchIds, onSearchIds, setGovLocatorId);

      }
    });

  }, [features, global, global.overpass, global.wikidata, lang, onSearchIds, searchIds]);

  const onChangeSearchHandler = (text: string) => {
    if (text !== '') {
      if (reconci) API.reconciLookup(text, lang, 20).then(data => {
        const searchEntities: WbSearchEntities[] = [];
        data.result.forEach(item => {
          searchEntities.push({id: item.id, label: item.name, description: item.description});
        });
        setWbSearchEntities(searchEntities);
      });
      else API.wdLookup(text, lang, 20).then(data => setWbSearchEntities(data.search));
    }
    else setWbSearchEntities([]);    
  };

  const onClickSearch = (id: string) => {
    global = {...defaultGlobal};
    const newListId = new ListID();
    newListId.wikidata.id = id;
    onSearchIds(newListId);
  };

  const handleReconci = (event: React.MouseEvent<HTMLElement>, value: string | null) => {
      setReconci(value);
      console.log('Reconci: ', value);
  };

  return (
    <div className='wikidata panel' style={style}>

      <div className='search-box'>
        <SearchList label='WikiData Suche' onChangeSearch={onChangeSearchHandler} onClickSearch={onClickSearch}
        getDescription={item => item.description} getId={item => item.id} getTitle={item => item.label} items={wbSearchEntities} />

        <ToggleButtonGroup
          value={reconci}
          exclusive
          onChange={handleReconci}
          aria-label="RECONCI"
        >
          <Tooltip title="verwendet Reconci zur Wikidata-Suche (genauer, aber langsamer)">
            <ToggleButton value="RECONCI" aria-label="RECONCI" >
              RECONCI
            </ToggleButton>
          </Tooltip>
        </ToggleButtonGroup> 
      </div>

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
                <Badge badgeContent={wdPop.total} color="primary"><div className='icon population'/></Badge>
                <span>Einwohner</span>
              </AccordionSummary>
              <AccordionDetails>{wdPop.chart}</AccordionDetails>
            </Accordion>
          )}

          {plzPop.chart && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />} className='accordionSum' >
                <Badge badgeContent={plzPop.total} color="primary"><div className='icon population'/></Badge>
                <span>Einwohner nach PLZ <em className='popplz'>(ges. {plzPop.sum}**)</em></span>
              </AccordionSummary>
              <AccordionDetails>{plzPop.chart}</AccordionDetails>
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
                {wdExtra.time && wdExtra.time.value.split('; ').map((s, i) => <p key={i}>
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
                <Security /><span>Wappen / Logos etc.pp.</span>
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
              <audio key={wdExtra.audioLabel.value} controls>
                <source src={wdExtra.audioLabel.value} type='audio/ogg; codecs="vorbis"' data-width='0' data-height='0' data-bandwidth='125373' />
              </audio>
              </AccordionDetails>
            </Accordion>
          )}

          <WdCard item={wdArchaelog} status={wdArchaelogStatus} label={['Nahe Archälogische Orte','25']} icon={<AccountBalance />} openPopup={openPopup} />
          <WdCard item={wdDungeon} status={wdDungeonStatus} label={['Nahe Höhlen','40']} icon={<div className='icon dungeon'/>} openPopup={openPopup} />
          <WdCard item={wdCastle} status={wdCastleStatus} label={['Nahe Burgen/Wehrbaue','25']} icon={<Castle />} openPopup={openPopup} />
          <WdCard item={wdChurch} status={wdChurchStatus} label={['Nahe Kirchen/Kloster','25']} icon={<Church />} openPopup={openPopup} />
          <WdCard item={wdBattle} status={wdBattleStatus} label={['Nahe Schlachten','40']} icon={<div className='icon swords'/>} openPopup={openPopup} />
          <WdCard item={wdKatastroph} status={wdKatastrophStatus} label={['Nahe Kastrastrophen','50']} icon={<div className='icon explosion'/>} openPopup={openPopup} />

          {groupTable.filter(f => f.lid).length !== 0 && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />} className='accordionSum' >
                <Badge badgeContent={groupTable.filter((f) => f.lid).length} color="primary"><div className='icon ref'/></Badge>
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
                              <HREF link={
                                externalRef[item.group]+c.lid.value 
                                + (item.group === 'archINFORM' ? '.htm' : '')
                                } text={c.lid.value} />
                            </p>
                        )}
                      </div>
                  ))}
                </Masonry>
                {govLocatorId !=='' && <>
                    <hr />
                    <p><strong>GOV-ID: </strong>
                    <HREF link={govLocatorId} text={govLocatorId.replaceAll(/^(.*\/)/g, '')} />
                    <span className="small"> ... berechnet!</span>
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
                <b>{item.group}</b><span>{WD.typ(item.items)}</span>
              </p>
            ))}
          </div>
        </Fragment>
      )}
    </div>
  );
};
