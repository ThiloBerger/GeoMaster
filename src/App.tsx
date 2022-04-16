import { Button, Tooltip } from '@mui/material';
import { CheckBoxOutlineBlankTwoTone, CheckBoxTwoTone, SaveAlt, SwitchLeft} from '@mui/icons-material';
import { FunctionComponent, ReactElement, useContext, useEffect, useState } from 'react';
import { Geonames } from './components/geonames';
import { GeoPortOst } from './components/geoportost';
import { Getty } from './components/getty';
import { Gov } from './components/gov';
import { Lang } from './types/lang';
import { ListID } from './interfaces/listID';
import { Gnd } from './components/Gnd';
import { MapPopup } from './components/piglets/MapPopup';
/* import { Slub } from './components/slub'; */
import { Wikidata } from './components/wikidata';

import '@fontsource/roboto'
import './App.scss';
import { Global } from './components/Global';
import saveAs from 'file-saver';
import { API } from './service/api';
import { ArgGisFeatures } from './interfaces/ArgGis';

export const App: FunctionComponent = (): ReactElement => {

  const global = useContext(Global);

  const lang = Lang.DE;
  const [showWikidata, setShowWikidata] = useState<boolean>(true);
  const [showGov, setShowGov] = useState<boolean>(true);
  const [showGnd, setShowGnd] = useState<boolean>(true);
  const [showGetty, setShowGetty] = useState<boolean>(false);
  const [showGeonames, setShowGeonames] = useState<boolean>(false);   
/*   const [showSlub, setShowSlub] = useState<boolean>(false); */
  const [showGeoPortOst, setShowGeoPortOst] = useState<boolean>(false);  
  const [searchIds, setSearchIds] = useState(new ListID());
  const [buttonOrder, setButtonOrder] = useState<number[]>([1,2,3,4,5,6]);
  const [popupUrl, setPopupUrl] = useState<string>('');
  const [popupOpen, setPopupOpen] = useState<boolean>(false);
  const [popupImage, setPopupImage] = useState<boolean>(false);
  const [features, setFeatures] = useState<ArgGisFeatures[]>([]);
  
  useEffect(() => {
    API.loadAgsPlz().then(data => setFeatures(data.features));
  }, []);

  const save = () => {
    const json = JSON.stringify(global);
    const blob = new Blob([json], {type: 'application/json'});
    saveAs(blob, `${global.search}_${new Date().toJSON().slice(0,10)}.json`);
  }

  const onSearchIdsHandler = (searchIds: ListID) => {
    setSearchIds({...searchIds});
  };

  const openPopup = (url: string, isImage: boolean = false) => {
    setPopupUrl(url);
    setPopupImage(isImage);
    setPopupOpen(true);
  }

  const closePopup = () => {
    setPopupOpen(false);
  }

  const onClickWikidataHandler = () => {
    const listId = {...searchIds};
    listId.wikidata.apiCall = false
    setSearchIds(listId);
    setShowWikidata(!showWikidata)
  }
  const onClickGovHandler = () => {
    const listId = {...searchIds};
    listId.gov.apiCall = false
    setSearchIds(listId);
    setShowGov(!showGov)
  }
  const onClickGndHandler = () => {
    const listId = {...searchIds};
    listId.gnd.apiCall = false
    setSearchIds(listId);
    setShowGnd(!showGnd)
  }
  const onClickGettyHandler = () => {
    const listId = {...searchIds};
    listId.getty.apiCall = false
    setSearchIds(listId);
    setShowGetty(!showGetty)
  }
  const onClickGeonamesHandler = () => {
    const listId = {...searchIds};
    listId.geonames.apiCall = false
    setSearchIds(listId);
    setShowGeonames(!showGeonames)
  }  
/*   const onClickSlubHandler = () => {
    const listId = {...searchIds};
    listId.slub.apiCall = false
    setSearchIds(listId);
    setShowSlub(!showSlub)
  } */
  const onClickGeoPortOstHandler = () => {
    const listId = {...searchIds};
    listId.geoportost.apiCall = false
    setSearchIds(listId);
    setShowGeoPortOst(!showGeoPortOst)
  }
  

  const sort = (id: number, r: number) => {
    const arr = [...buttonOrder];
    let idx = arr.findIndex((i) => i === id);
    arr.splice(idx, 1);
    idx += r;
    arr.splice(idx < 0 ? 0 : idx, 0, id);
    setButtonOrder(arr);
  };

  return (
    <div data-box>
      <MapPopup url={popupUrl} open={popupOpen} close={closePopup} image={popupImage}/>
      <div className='loading'>
          {searchIds.wikidata.status && <div></div>}
          {searchIds.getty.status && <div></div>}
          {searchIds.gov.status && <div></div>}
          {searchIds.gnd.status && <div></div>}
          {searchIds.slub.status && <div></div>}
          {searchIds.geonames.status && <div></div>}
          {searchIds.geoportost.status && <div></div>}
      </div>
      <div data-buttons>
        <div className='button-container' style={{order: buttonOrder.findIndex((i) => i === 1)}}>
          <Button variant='contained' onClick={()=>sort(1,-1)}><SwitchLeft /></Button>
          <Button variant='contained' onClick={()=>onClickWikidataHandler()} className={searchIds.wikidata.id !== '' ? 'found': ''}>Wikidata&nbsp;{showWikidata?<CheckBoxTwoTone />:<CheckBoxOutlineBlankTwoTone />}</Button>
        </div>
        <div className='button-container' style={{order: buttonOrder.findIndex((i) => i === 2)}}>
          <Button variant='contained' onClick={()=>sort(2,-1)}><SwitchLeft /></Button>
          <Button variant='contained' onClick={()=>onClickGovHandler()} className={searchIds.gov.id !== '' ? 'found': ''}>GOV&nbsp;{showGov?<CheckBoxTwoTone />:<CheckBoxOutlineBlankTwoTone />}</Button>
        </div>
        <div className='button-container' style={{order: buttonOrder.findIndex((i) => i === 3)}}>
          <Button variant='contained' onClick={()=>sort(3,-1)}><SwitchLeft /></Button>
          <Button variant='contained' onClick={()=>onClickGndHandler()} className={searchIds.gnd.id !== '' ? 'found': ''}>GND&nbsp;{showGnd?<CheckBoxTwoTone />:<CheckBoxOutlineBlankTwoTone />}</Button>
        </div>
        <div className='button-container' style={{order: buttonOrder.findIndex((i) => i === 4)}}>
          <Button variant='contained' onClick={()=>sort(4,-1)}><SwitchLeft /></Button>
          <Button variant='contained' onClick={()=>onClickGettyHandler()} className={searchIds.getty.id !== '' ? 'found': ''}>TGN&nbsp;{showGetty?<CheckBoxTwoTone />:<CheckBoxOutlineBlankTwoTone />}</Button>
        </div>
        <div className='button-container' style={{order: buttonOrder.findIndex((i) => i === 5)}}>
          <Button variant='contained' onClick={()=>sort(5,-1)}><SwitchLeft /></Button>
          <Button variant='contained' onClick={()=>onClickGeonamesHandler()} className={searchIds.geonames.id !== '' ? 'found': ''}>GeoNames&nbsp;{showGeonames?<CheckBoxTwoTone />:<CheckBoxOutlineBlankTwoTone />}</Button>
        </div>
{/*         <div className='button-container' style={{order: buttonOrder.findIndex((i) => i === 6)}}>
          <Button variant='contained' onClick={()=>sort(6,-1)}><SwitchLeft /></Button>
          <Button variant='contained' onClick={()=>onClickSlubHandler()} className={searchIds.slub.id !== '' ? 'found': ''}>SLUB&nbsp;{showSlub?<CheckBoxTwoTone />:<CheckBoxOutlineBlankTwoTone />}</Button>
        </div> */}
        <div className='button-container' style={{order: buttonOrder.findIndex((i) => i === 6)}}>
          <Button variant='contained' onClick={()=>sort(6,-1)}><SwitchLeft /></Button>
          <Button variant='contained' onClick={()=>onClickGeoPortOstHandler()} className={searchIds.slub.id !== '' ? 'found': ''}>GeoPort&nbsp;{showGeoPortOst?<CheckBoxTwoTone />:<CheckBoxOutlineBlankTwoTone />}</Button>
        </div>
        <Tooltip title={`${global.search}.json (${(new Blob([JSON.stringify(global)], {type: 'application/json'}).size/1024).toFixed(1)} KB)`}>
          <Button variant='contained' onClick={()=>save()} endIcon={<SaveAlt/>} className='save'>Save</Button>
        </Tooltip>
      </div>
      <div id='svg'><div></div></div>
      <div className='tabs'>
        {showWikidata && <Wikidata style={{order: buttonOrder.findIndex((i) => i === 1)}} searchIds={searchIds} lang={lang} openPopup={openPopup} onSearchIds={onSearchIdsHandler} features={features}/>}
        {showGov && <Gov style={{order: buttonOrder.findIndex((i) => i === 2)}} searchIds={searchIds} openPopup={openPopup}  onSearchIds={onSearchIdsHandler}/>}
        {showGnd && <Gnd style={{order: buttonOrder.findIndex((i) => i === 3)}} searchIds={searchIds} openPopup={openPopup} onSearchIds={onSearchIdsHandler}/>}
        {showGetty && <Getty style={{order: buttonOrder.findIndex((i) => i === 4)}} searchIds={searchIds} onSearchIds={onSearchIdsHandler}/>}
        {showGeonames && <Geonames style={{order: buttonOrder.findIndex((i) => i === 5)}} searchIds={searchIds} openPopup={openPopup} onSearchIds={onSearchIdsHandler}/>}
        {/* {showSlub && <Slub style={{order: buttonOrder.findIndex((i) => i === 6)}} searchIds={searchIds} onSearchIds={onSearchIdsHandler}/>}
         */}{showGeoPortOst && <GeoPortOst style={{order: buttonOrder.findIndex((i) => i === 6)}} searchIds={searchIds} onSearchIds={onSearchIdsHandler}/>}
      </div>
    </div>
  );
}
