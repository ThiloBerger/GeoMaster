/* eslint-disable jsx-a11y/anchor-is-valid */
import { FunctionComponent, ReactElement, useState } from 'react';
import { Wikidata } from './components/wikidata';
import { Gov } from './components/gov';
import { Getty } from './components/getty';
import { Lang } from './types/lang';
import { Lobid } from './components/lobid';
import { Button, ButtonGroup } from '@mui/material';
import { ArrowLeft, ArrowRight, CheckBoxOutlineBlankTwoTone, CheckBoxTwoTone } from '@mui/icons-material';

import { MapPopup } from './components/piglets/MapPopup';
import { ListID } from './interfaces/listID';
import { Slub } from './components/slub';
import { Geonames } from './components/geonames';



import '@fontsource/roboto'
import './App.scss';
import { GeoPortOst } from './components/geoportost';
/* import { GeoPortOst } from './components/geoportost'; */
export const App: FunctionComponent = (): ReactElement => {
  

/*     const [isDown, setIsDown] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

useEffect(() => {

    const slider = document.querySelector('.horizontal') as HTMLElement;

    
    if (slider) {
    slider.addEventListener('mousedown', (e: any) => {
      setIsDown(true);
      slider.classList.add('active');
      setStartX(e.pageX - slider.offsetLeft);
      setScrollLeft(slider.scrollLeft);
    });
    slider.addEventListener('mouseleave', () => {
      setIsDown(false);
      slider.classList.remove('active');
    });
    slider.addEventListener('mouseup', () => {
      setIsDown(false);
      slider.classList.remove('active');
    });
    slider.addEventListener('mousemove', (e: any) => {
      if(!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 3; //scroll-fast
      slider.scrollLeft = scrollLeft - walk;
      console.log(walk);
    });
  
    }
    console.log(slider);
}, [isDown, scrollLeft, startX]);
 */






  const lang = Lang.DE;
  const [showWikidata, setShowWikidata] = useState<boolean>(true);
  const [showGov, setShowGov] = useState<boolean>(true);
  const [showLobid, setShowLobid] = useState<boolean>(true);
  const [showGetty, setShowGetty] = useState<boolean>(false);
  const [showGeonames, setShowGeonames] = useState<boolean>(false);   
  const [showSlub, setShowSlub] = useState<boolean>(false);
  const [showGeoPortOst, setShowGeoPortOst] = useState<boolean>(false);  
  const [searchIds, setSearchIds] = useState(new ListID());
  const [buttonOrder, setButtonOrder] = useState<number[]>([1,2,3,4,5,6,7]);
  const [popupUrl, setPopupUrl] = useState<string>('');
  const [popupOpen, setPopupOpen] = useState<boolean>(false);
  const [popupImage, setPopupImage] = useState<boolean>(false);

  const onSearchIdsHandler = (searchIds: ListID) => {
    //console.log({...searchIds})
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
  const onClickLobidHandler = () => {
    const listId = {...searchIds};
    listId.lobid.apiCall = false
    setSearchIds(listId);
    setShowLobid(!showLobid)
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
  const onClickSlubHandler = () => {
    const listId = {...searchIds};
    listId.slub.apiCall = false
    setSearchIds(listId);
    setShowSlub(!showSlub)
  }
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
          {searchIds.lobid.status && <div></div>}
          {searchIds.slub.status && <div></div>}
          {searchIds.geonames.status && <div></div>}
          {searchIds.geoportost.status && <div></div>}
      </div>
      <div data-buttons>
        <ButtonGroup variant='contained' style={{order: buttonOrder.findIndex((i) => i === 1)}}>
          <Button onClick={()=>sort(1,-1)}><ArrowLeft /></Button>
          <Button onClick={()=>onClickWikidataHandler()} className={searchIds.wikidata.id !== '' ? 'found': ''}>Wikidata&nbsp;{showWikidata?<CheckBoxTwoTone />:<CheckBoxOutlineBlankTwoTone />}</Button>
          <Button onClick={()=>sort(1,1)}><ArrowRight /></Button>
        </ButtonGroup>
        <ButtonGroup variant='contained' style={{order: buttonOrder.findIndex((i) => i === 2)}}>
          <Button onClick={()=>sort(2,-1)}><ArrowLeft /></Button>
          <Button onClick={()=>onClickGovHandler()} className={searchIds.gov.id !== '' ? 'found': ''}>GOV&nbsp;{showGov?<CheckBoxTwoTone />:<CheckBoxOutlineBlankTwoTone />}</Button>
          <Button onClick={()=>sort(2,1)}><ArrowRight /></Button>
        </ButtonGroup>
        <ButtonGroup variant='contained' style={{order: buttonOrder.findIndex((i) => i === 3)}}>
          <Button onClick={()=>sort(3,-1)}><ArrowLeft /></Button>
          <Button onClick={()=>onClickLobidHandler()} className={searchIds.lobid.id !== '' ? 'found': ''}>LOBID&nbsp;{showLobid?<CheckBoxTwoTone />:<CheckBoxOutlineBlankTwoTone />}</Button>
          <Button onClick={()=>sort(3,1)}><ArrowRight /></Button>
        </ButtonGroup>
        <ButtonGroup variant='contained' style={{order: buttonOrder.findIndex((i) => i === 4)}}>
          <Button onClick={()=>sort(4,-1)}><ArrowLeft /></Button>
          <Button onClick={()=>onClickGettyHandler()} className={searchIds.getty.id !== '' ? 'found': ''}>GETTY TGN&nbsp;{showGetty?<CheckBoxTwoTone />:<CheckBoxOutlineBlankTwoTone />}</Button>
          <Button onClick={()=>sort(4,1)}><ArrowRight /></Button>
        </ButtonGroup>
        <ButtonGroup variant='contained' style={{order: buttonOrder.findIndex((i) => i === 5)}}>
          <Button onClick={()=>sort(5,-1)}><ArrowLeft /></Button>
          <Button onClick={()=>onClickGeonamesHandler()} className={searchIds.geonames.id !== '' ? 'found': ''}>GeoNames&nbsp;{showGeonames?<CheckBoxTwoTone />:<CheckBoxOutlineBlankTwoTone />}</Button>
          <Button onClick={()=>sort(5,1)}><ArrowRight /></Button>
        </ButtonGroup>
        <ButtonGroup variant='contained' style={{order: buttonOrder.findIndex((i) => i === 6)}}>
          <Button onClick={()=>sort(6,-1)}><ArrowLeft /></Button>
          <Button onClick={()=>onClickSlubHandler()} className={searchIds.slub.id !== '' ? 'found': ''}>SLUB Maps&nbsp;{showSlub?<CheckBoxTwoTone />:<CheckBoxOutlineBlankTwoTone />}</Button>
          <Button onClick={()=>sort(6,1)}><ArrowRight /></Button>
        </ButtonGroup>
        <ButtonGroup variant='contained' style={{order: buttonOrder.findIndex((i) => i === 7)}}>
          <Button onClick={()=>sort(7,-1)}><ArrowLeft /></Button>
          <Button onClick={()=>onClickGeoPortOstHandler()} className={searchIds.slub.id !== '' ? 'found': ''}>GeoPortOst&nbsp;{showGeoPortOst?<CheckBoxTwoTone />:<CheckBoxOutlineBlankTwoTone />}</Button>
          <Button onClick={()=>sort(7,1)}><ArrowRight /></Button>
        </ButtonGroup>
      </div>
      
      <div className='tabs'>
        {showWikidata && <Wikidata style={{order: buttonOrder.findIndex((i) => i === 1)}} searchIds={searchIds} lang={lang} openPopup={openPopup} onSearchIds={onSearchIdsHandler} />}
        {showGov && <Gov style={{order: buttonOrder.findIndex((i) => i === 2)}} searchIds={searchIds} openPopup={openPopup}  onSearchIds={onSearchIdsHandler}/>}
        {showLobid && <Lobid style={{order: buttonOrder.findIndex((i) => i === 3)}} searchIds={searchIds} openPopup={openPopup} onSearchIds={onSearchIdsHandler}/>}
        {showGetty && <Getty style={{order: buttonOrder.findIndex((i) => i === 4)}} searchIds={searchIds} onSearchIds={onSearchIdsHandler}/>}
        {showGeonames && <Geonames style={{order: buttonOrder.findIndex((i) => i === 5)}} searchIds={searchIds} openPopup={openPopup} onSearchIds={onSearchIdsHandler}/>}
        {showSlub && <Slub style={{order: buttonOrder.findIndex((i) => i === 6)}} searchIds={searchIds} onSearchIds={onSearchIdsHandler}/>}
        {showGeoPortOst && <GeoPortOst style={{order: buttonOrder.findIndex((i) => i === 7)}} searchIds={searchIds} onSearchIds={onSearchIdsHandler}/>}
      </div>
    </div>
  );
}
