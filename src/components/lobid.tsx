import { Fragment, FunctionComponent, ReactElement, useEffect, useState } from 'react';
import { LobidItems } from '../interfaces/lobidJson';
import { ListID } from '../interfaces/listID';
import { API } from '../service/api';
import { HREF } from './piglets/Link';
import { LOB } from '../util/util';
import { Button } from '@mui/material';
import { PanelProps } from '../interfaces/panelProps';
import { Map } from '@mui/icons-material';
import { LngLat } from '../util/WGS84';
import { SearchList } from './piglets/SearchList';
import { LobidItem } from './piglets/LobidItem';

export const Lobid: FunctionComponent<PanelProps> = ({
  style,
  searchIds,
  openPopup = () => {},
  onSearchIds,
}): ReactElement => {
  const [dataObj, setDataObject] = useState<LobidItems>();
  const [lobidSearchEntities, setLobidSearchEntities] = useState<LobidItems[]>([]);

  useEffect(() => {
    
    if (searchIds.lobid.apiCall || searchIds.lobid.id === '') return;
    console.log('Lobid USEEFFECT: ', searchIds.lobid.id);
    searchIds.lobid.apiCall = true;
    searchIds.lobid.status = true;
    onSearchIds({...searchIds});

    API.getLobid(searchIds.lobid.id).then(async (data) => {
      console.log('Lobid USEEFFECT: ',data.member[0]);
      setDataObject(data.member[0]);

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

        searchIds.lobid.status = false;
        onSearchIds({...searchIds});

    });
    
  }, [searchIds, openPopup, onSearchIds]);

  const onChangeSearchHandler = (text: string) => {
    if (text !== "")
    API.getLobidSearch(text).then((data) => {
      const items = data.member.filter((item) =>
        item.type.includes('AuthorityResource')
      );
      items.sort((a, b) =>
        a.preferredName.localeCompare(b.preferredName)
      );
      setLobidSearchEntities(items);
    })
    else setLobidSearchEntities([]);
  };

  const onClickSearch = (id: string) => {
    const newListId = new ListID();
    newListId.lobid.id = id;
    onSearchIds(newListId);
  };

  return (
    <div className='lobid panel' style={style}>


      <SearchList label='GND Suche' onChangeSearch={onChangeSearchHandler} onClickSearch={onClickSearch}
       getDescription={item => item.biographicalOrHistoricalInformation
        ? item.biographicalOrHistoricalInformation[0]
        : item.definition
        ? item.definition[0]
        : item.variantName
        ? `wurde auch genannt: ${item.variantName}`
        : ''} getId={item => item.gndIdentifier} getTitle={item => item.preferredName} items={lobidSearchEntities} />


      <h3>
        lobid.org
        <br />
        <span>GND aus dem KATALOG DER DEUTSCHEN NATIONALBIBLIOTHEK</span>
      </h3>
      {searchIds.lobid.id !== '' && (
        <Fragment>
          <p>
            <strong>GND ID: </strong>
            <HREF link={`https://d-nb.info/gnd/${searchIds.lobid.id}`} text={searchIds.lobid.id}/>
          </p>
          <div className='tablelist'>
            <LobidItem item={dataObj} label='Name:' attr='preferredName' method={(s: string) => s} />
            <LobidItem item={dataObj} label='andere Bezeichnungen:' attr='variantName' method={LOB.extractString} />
            <LobidItem item={dataObj} label='verknüpft mit:' attr='relatedPlaceOrGeographicName' method={LOB.extractLinkArray} />
            <LobidItem item={dataObj} label='verwandter Begriff:' attr='relatedTerm' method={LOB.extractLinkArray} />
            <LobidItem item={dataObj} label='Historische Informationen:' attr='biographicalOrHistoricalInformation' method={LOB.extractStringAsBlock} />
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
            <LobidItem  item={dataObj} label='Homepage:' attr='homepage' method={LOB.extractLinkArray}/>
            <LobidItem  item={dataObj} label='siehe auch:' attr='sameAs' method={LOB.extractID}/>
            {dataObj?.wikipedia && (
              <p>
                <b>Wikipedia:</b>
                <span>
                  <HREF link={dataObj.wikipedia[0].label} text='' />
                </span>
              </p>
            )}            
            <LobidItem  item={dataObj} label='Kategorie:' attr='broaderTermInstantial' method={LOB.extractLinkArray}/>
            <LobidItem  item={dataObj} label='Teil von:' attr='hierarchicalSuperiorOfPlaceOrGeographicName' method={LOB.extractLinkArray}/>
            <LobidItem  item={dataObj} label='Gründungsdatum:' attr='dateOfEstablishment' method={LOB.extractString}/>
            <LobidItem  item={dataObj} label='bestand bis:' attr='dateOfTermination' method={LOB.extractString}/>
            <LobidItem  item={dataObj} label='gehört zu:' attr='broaderTermPartitive' method={LOB.extractLinkArray}/>
            <LobidItem  item={dataObj} label='vormals:' attr='precedingPlaceOrGeographicName' method={LOB.extractLinkArray}/>
            <LobidItem  item={dataObj} label='später:' attr='succeedingPlaceOrGeographicName' method={LOB.extractLinkArray}/>
            <LobidItem  item={dataObj} label='Beschreibung:' attr='definition' method={LOB.extractString}/>
            <LobidItem  item={dataObj} label='Unterkategorie:' attr='gndSubjectCategory' method={LOB.extractLinkArray}/>
            <LobidItem  item={dataObj} label='geograf. Bezug:' attr='placeOfBusiness' method={LOB.extractLinkArray}/>
            <LobidItem  item={dataObj} label='Zeit:' attr='dateOfEstablishmentAndTermination' method={LOB.extractString}/>
            <LobidItem  item={dataObj} label='erstellt:' attr='dateOfProduction' method={LOB.extractString}/>
            <LobidItem  item={dataObj} label='Geografischer Bezug:' attr='temporaryNameOfThePlaceOrGeographicName' method={LOB.extractLinkArray}/>
            <LobidItem  item={dataObj} label='zeitweise genannt:' attr='temporaryNameOfThePlaceOrGeographicName' method={LOB.extractLinkArray}/>
          </div>
        </Fragment>
      )}
    </div>
  );
};


/* 

            {dataObj?.preferredName && (
              <p>
                <b>Name:</b>
                <span>{dataObj.preferredName}</span>
              </p>
            )}
            {dataObj?.variantName && (
              <p>
                <b>andere Bezeichnungen:</b>
                <span>{LOB.extractString(dataObj.variantName)}</span>
              </p>
            )}
            {dataObj?.relatedPlaceOrGeographicName && (
              <p>
                <b>verknüpft mit:</b>
                <span>
                  {LOB.extractLinkArray(dataObj.relatedPlaceOrGeographicName)}
                </span>
              </p>
            )}
            {dataObj?.relatedTerm && (
              <p>
                <b>verwandter Begriff:</b>
                <span>{LOB.extractLinkArray(dataObj.relatedTerm)}</span>
              </p>
            )}
            {dataObj?.biographicalOrHistoricalInformation && (
              <p>
                <b>Historische Informationen:</b>
                <span>
                  {LOB.extractStringAsBlock(
                    dataObj.biographicalOrHistoricalInformation
                  )}
                </span>
              </p>
            )}

            {dataObj?.homepage && (
              <p>
                <b>Homepage:</b>
                <span>{LOB.extractLinkArray(dataObj.homepage)}</span>
              </p>
            )}

            {dataObj?.sameAs && (
              <p>
                <b>siehe auch:</b>
                <span>{LOB.extractID(dataObj.sameAs)}</span>
              </p>
            )}

            {dataObj?.broaderTermInstantial && (
              <p>
                <b>Kategorie:</b>
                <span>
                  {LOB.extractLinkArray(dataObj.broaderTermInstantial)}
                </span>
              </p>
            )}
            {dataObj?.hierarchicalSuperiorOfPlaceOrGeographicName && (
              <p>
                <b>Teil von:</b>
                <span>
                  {LOB.extractLinkArray(
                    dataObj.hierarchicalSuperiorOfPlaceOrGeographicName
                  )}
                </span>
              </p>
            )}
            {dataObj?.dateOfEstablishment && (
              <p>
                <b>Gründungsdatum: </b>
                <span>{LOB.extractString(dataObj.dateOfEstablishment)}</span>
              </p>
            )}
            {dataObj?.dateOfTermination && (
              <p>
                <b>bestand bis: </b>
                <span>{LOB.extractString(dataObj.dateOfTermination)}</span>
              </p>
            )}
            {dataObj?.broaderTermPartitive && (
              <p>
                <b>gehört zu: </b>
                <span>
                  {LOB.extractLinkArray(dataObj.broaderTermPartitive)}
                </span>
              </p>
            )}
            {dataObj?.precedingPlaceOrGeographicName && (
              <p>
                <b>vormals:</b>
                <span>
                  {LOB.extractLinkArray(dataObj.precedingPlaceOrGeographicName)}
                </span>
              </p>
            )}
            {dataObj?.succeedingPlaceOrGeographicName && (
              <p>
                <b>später:</b>
                <span>
                  {LOB.extractLinkArray(
                    dataObj.succeedingPlaceOrGeographicName
                  )}
                </span>
              </p>
            )}
            {dataObj?.definition && (
              <p>
                <b>Beschreibung:</b>
                <span>{LOB.extractString(dataObj.definition)}</span>
              </p>
            )}
            {dataObj?.gndSubjectCategory && (
              <p>
                <b>Unterkategorie: </b>
                <span>{LOB.extractLinkArray(dataObj.gndSubjectCategory)}</span>
              </p>
            )}
            {dataObj?.placeOfBusiness && (
              <p>
                <b>geograf. Bezug: </b>
                <span>{LOB.extractLinkArray(dataObj.placeOfBusiness)}</span>
              </p>
            )}
            {dataObj?.dateOfEstablishmentAndTermination && (
              <p>
                <b>Zeit: </b>
                <span>
                  {LOB.extractString(dataObj.dateOfEstablishmentAndTermination)}
                </span>
              </p>
            )}
            {dataObj?.dateOfProduction && (
              <p>
                <b>erstellt: </b>
                <span>{LOB.extractString(dataObj.dateOfProduction)}</span>
              </p>
            )}
            {dataObj?.place && (
              <p>
                <b>Geografischer Bezug: </b>
                <span>{LOB.extractLinkArray(dataObj.place)}</span>
              </p>
            )}
            {dataObj?.temporaryNameOfThePlaceOrGeographicName && (
              <p>
                <b>zeitweise genannt: </b>
                <span>
                  {LOB.extractLinkArray(
                    dataObj.temporaryNameOfThePlaceOrGeographicName
                  )}
                </span>
              </p>
            )}




*/