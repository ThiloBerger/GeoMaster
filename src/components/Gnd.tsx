import { Map } from '@mui/icons-material';
import { Button } from '@mui/material';
import { Fragment, FunctionComponent, ReactElement, useContext, useEffect, useState } from 'react';
import { GndData } from '../interfaces/GndJson';
import { ListID } from '../interfaces/listID';
import { PanelProps } from '../interfaces/panelProps';
import { API } from '../service/api';
import { LOB } from '../util/util';
import { LngLat } from '../util/WGS84';
import { defaultGlobal, Global } from './Global';
import { GndItem } from './piglets/GndItem';
import { HREF } from './piglets/Link';
import { SearchList } from './piglets/SearchList';
import { fuzzy } from 'fast-fuzzy';


export const Gnd: FunctionComponent<PanelProps> = ({
  style,
  searchIds,
  openPopup = () => {},
  onSearchIds,
}): ReactElement => {

  let global = useContext(Global);

  const [dataObj, setDataObject] = useState<GndData>({} as GndData);
  const [gndSearchEntities, setGndSearchEntities] = useState<GndData[]>([]);

  useEffect(() => {
    
    if (searchIds.gnd.apiCall || searchIds.gnd.id === '') return;
    console.log('Gnd USEEFFECT: ', searchIds.gnd.id);
    global.gnd.id = searchIds.gnd.id;
    searchIds.gnd.apiCall = true;
    searchIds.gnd.status = true;
    onSearchIds({...searchIds});

    API.gndEntryById(searchIds.gnd.id).then(async (data) => {
      console.log('Gnd USEEFFECT: ',data.member[0]);
      if (!data.member[0]) {
        searchIds.gnd.status = false;
        searchIds.gnd.id = '';
        onSearchIds({...searchIds});
        return;
      }
      setDataObject(data.member[0]);
      global.gnd.data = data.member[0];

      if (data.member[0].sameAs) data.member[0].sameAs.forEach( el => {
        const id = el.id;
        if (id.includes('.wikidata.')){
          searchIds.wikidata.id = id.replaceAll(/^(.*\/)/g, '');
          onSearchIds({...searchIds});
        }
        if (id.includes('.geonames.')){
          searchIds.geonames.id = id.replaceAll(/^(.*\/)/g, '');
          onSearchIds({...searchIds});
        }
      });

      if (searchIds.slub.id === '' && data.member[0].hasGeometry) {
        const point = data.member[0].hasGeometry[0].asWKT[0]
        const lngLat: LngLat = LOB.pointToLngLat(point);
        searchIds.slub.id = JSON.stringify(lngLat);
        onSearchIds({...searchIds});
      }

        searchIds.gnd.status = false;
        onSearchIds({...searchIds});

    });
    
  }, [searchIds, openPopup, onSearchIds, global.gnd]);

  const onChangeSearchHandler = (text: string) => {
    if (text !== '')
    API.gndLookup(text).then((data) => {
      console.log('GND',data)
      const items = data.member.filter((item) => item.type.includes('AuthorityResource'));
      console.log('GND',items)
      console.log('GND',data.member.filter((item) => item.type.includes('PlaceOrGeographicName')))
      for (const entry of items) entry.fuzzy = fuzzy(entry.preferredName, text);
      items.sort((b, a) => a.fuzzy && b.fuzzy ? a.fuzzy - b.fuzzy: 0);
      setGndSearchEntities(items);
    })
    else setGndSearchEntities([]);
  };

  const onClickSearch = (id: string) => {
    global = {...defaultGlobal};
    const newListId = new ListID();
    newListId.gnd.id = id;
    onSearchIds(newListId);
  };

  return (
    <div className='gnd panel' style={style}>
      <SearchList label='GND Suche' onChangeSearch={onChangeSearchHandler} onClickSearch={onClickSearch}
       getDescription={item => item.biographicalOrHistoricalInformation
        ? item.biographicalOrHistoricalInformation[0]
        : item.definition
        ? item.definition[0]
        : item.variantName
        ? `wurde auch genannt: ${item.variantName}`
        : ''} getId={item => item.gndIdentifier} getTitle={item => item.preferredName} items={gndSearchEntities} />
      <h3>
        lobid.org
        <br />
        <span>GND aus dem KATALOG DER DEUTSCHEN NATIONALBIBLIOTHEK</span>
      </h3>
      {searchIds.gnd.id !== '' && (
        <Fragment>
          <p>
            <strong>GND ID: </strong>
            <HREF link={`https://d-nb.info/gnd/${searchIds.gnd.id}`} text={searchIds.gnd.id}/>
          </p>
          <div className='tablelist'>
            <GndItem item={dataObj} label='Name:' attr='preferredName' method={(s: string) => s} />
            <GndItem item={dataObj} label='andere Bezeichnungen:' attr='variantName' method={LOB.extractString} />
            <GndItem item={dataObj} label='verknüpft mit:' attr='relatedPlaceOrGeographicName' method={LOB.extractLinkArray} />
            <GndItem item={dataObj} label='verwandter Begriff:' attr='relatedTerm' method={LOB.extractLinkArray} />
            <GndItem item={dataObj} label='Historische Informationen:' attr='biographicalOrHistoricalInformation' method={LOB.extractStringAsBlock} />
            {dataObj?.geographicAreaCode && (
              <p>
                <b>Land:</b>
                <span>
                  {dataObj.geographicAreaCode.map((g, i) => (
                    <HREF
                      key={g.id + i}
                      link={g.id}
                      text={`${g.label} ${g.id.replaceAll(/^.*#/g, '')}`}
                    />
                  ))}
                </span>
              </p>
            )}
            {dataObj?.hasGeometry && (
              <p>
                <b>Koordinaten:</b>
                <span>
                  {LOB.pointToCoordinate(dataObj.hasGeometry[0].asWKT[0])}{' '}
                  <Button
                    onClick={() =>
                      openPopup(
                        `https://maps.google.com/maps?q=${LOB.pointToCoordinate(
                          dataObj.hasGeometry[0].asWKT[0]
                        )}&t=&z=11&ie=UTF8&iwloc=en&output=embed`
                      )
                    }
                  ><Map /> Karte
                  </Button>
                </span>
              </p>
            )}
            <GndItem  item={dataObj} label='Homepage:' attr='homepage' method={LOB.extractLinkArray}/>
            <GndItem  item={dataObj} label='siehe auch:' attr='sameAs' method={LOB.extractID}/>
            {dataObj?.wikipedia && (
              <p>
                <b>Wikipedia:</b>
                <span>
                  <HREF link={dataObj.wikipedia[0].label} text='' />
                </span>
              </p>
            )}            
            <GndItem  item={dataObj} label='Kategorie:' attr='broaderTermInstantial' method={LOB.extractLinkArray}/>
            <GndItem  item={dataObj} label='Teil von:' attr='hierarchicalSuperiorOfPlaceOrGeographicName' method={LOB.extractLinkArray}/>
            <GndItem  item={dataObj} label='Gründungsdatum:' attr='dateOfEstablishment' method={LOB.extractString}/>
            <GndItem  item={dataObj} label='bestand bis:' attr='dateOfTermination' method={LOB.extractString}/>
            <GndItem  item={dataObj} label='gehört zu:' attr='broaderTermPartitive' method={LOB.extractLinkArray}/>
            <GndItem  item={dataObj} label='vormals:' attr='precedingPlaceOrGeographicName' method={LOB.extractLinkArray}/>
            <GndItem  item={dataObj} label='später:' attr='succeedingPlaceOrGeographicName' method={LOB.extractLinkArray}/>
            <GndItem  item={dataObj} label='Beschreibung:' attr='definition' method={LOB.extractString}/>
            <GndItem  item={dataObj} label='Unterkategorie:' attr='gndSubjectCategory' method={LOB.extractLinkArray}/>
            <GndItem  item={dataObj} label='geograf. Bezug:' attr='placeOfBusiness' method={LOB.extractLinkArray}/>
            <GndItem  item={dataObj} label='Zeit:' attr='dateOfEstablishmentAndTermination' method={LOB.extractString}/>
            <GndItem  item={dataObj} label='erstellt:' attr='dateOfProduction' method={LOB.extractString}/>
            <GndItem  item={dataObj} label='Geografischer Bezug:' attr='place' method={LOB.extractLinkArray}/>
            <GndItem  item={dataObj} label='zeitweise genannt:' attr='temporaryNameOfThePlaceOrGeographicName' method={LOB.extractLinkArray}/>
          </div>
        </Fragment>
      )}
    </div>
  );
};
