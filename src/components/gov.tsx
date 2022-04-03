import { ExpandMore, GpsFixed, InsertChart } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Badge } from '@mui/material';
import { Fragment, FunctionComponent, ReactElement, useEffect, useState } from 'react';
import { GovObject } from '../interfaces/govRdf';
import { PanelProps } from '../interfaces/panelProps';
import { getGovObject } from '../service/api';
import { GOV, GOVLib } from '../util/util';
import { LngLat } from '../util/WGS84';
import { GOVPop, GovPopulationChart } from './GovPopulationChart';
import { GovMaps, GovPosition } from './GovPosition';


import { HREF } from './piglets/Link';
import { GovAreaChart } from './GovAreaChart';



export const Gov: FunctionComponent<PanelProps> = ({style, searchIds, onSearchIds, openPopup = () => {}}): ReactElement => {

    const [govPop, setGovPop] = useState<GOVPop>(JSON.parse('{}'));
    const [govPos, setGovPos] = useState<ReactElement>(<></>);
    const [govArea, setGovArea] = useState<ReactElement>(<></>);
    const [gov, setGov] = useState<GovObject>();

    useEffect(() => {

        if (searchIds.gov.apiCall || searchIds.gov.id === '') return;
        console.log('GOV USEEFFECT: ', searchIds.gov.id)
        searchIds.gov.apiCall = true;
        searchIds.gov.status = true;
        onSearchIds({...searchIds});

        getGovObject(searchIds.gov.id).then( async data => {
            const json = GOV.xml2json(data);
            const govObj = GOV.jsonToGOV(json);
            console.log('GOV USEEFFECT: ', govObj);
            setGov(govObj);
            setGovPop(GovPopulationChart(govObj));
            setGovPos(GovPosition(govObj));
            setGovArea(GovAreaChart(govObj));

            if (govObj['gov:position'] && searchIds.slub.id === '') {
                const point= govObj['gov:position']['wgs84:Point']
                const lon = parseFloat(point['wgs84:lon']);
                const lat = parseFloat(point['wgs84:lat']);
                const lngLat: LngLat = [lon, lat];
                searchIds.slub.id = JSON.stringify(lngLat);
                onSearchIds({...searchIds});
            }

            // const d = '1990-10-30'
            // const date = Date.parse(d)
            // console.log(date)
            // console.log((new Date(date)).toLocaleString('de-DE',{dateStyle: 'long'}))

              searchIds.gov.status = false;
              onSearchIds({...searchIds});

        })
        
    }, [searchIds, onSearchIds]);



    return (
      <div className='gov panel' style={style}>
        <div className='search'>
          <p>
            Das GOV wird automatisch durchsucht, wenn eine GOV-ID vorhanden ist oder hergeleitet werden kann.
          </p>
        </div>
        <h3>
          gov.genealogy.net
          <br />
          <span>Geschichtliche Orts-Verzeichnis</span>
        </h3>
        {searchIds.gov.id !== '' && (
          <Fragment>
            <p>
              <strong>GOV ID: </strong>
              <HREF link={`http://gov.genealogy.net/item/show/${searchIds.gov.id}`} text={searchIds.gov.id} />
            </p>
            {searchIds.gov.id !== '' && govPop.chart && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />} className='accordionSum' >
                  <Badge badgeContent={govPop.total} color="primary"><InsertChart /></Badge><span>Einwohner</span>
                </AccordionSummary>
                <AccordionDetails>{govPop.chart}</AccordionDetails>
              </Accordion>
            )}

            {gov && (gov['gov:position'] || gov['gov:hasArea']) && searchIds.gov.id !== '' && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />} className='accordionSum' >
                  <GpsFixed /><span>Geografische Informationen</span>
                </AccordionSummary>
                <AccordionDetails className='geo'>
                  {gov['gov:hasArea'] && <p style={{textAlign:'center'}}>Fläche in Km<sup>2</sup></p>}
                  {govArea}
                  {govPos}
                  {gov['gov:position'] && <GovMaps entity={gov} openPopup={openPopup}/>}
                </AccordionDetails>
              </Accordion>
            )}

            <div className='tablelist'>
              {gov && gov['gov:hasMunicipalityId'] && (
                <p><b>amtlicher Gemeindeschlüssel:</b><span>{GOVLib.ags(gov)}</span></p>
              )}

              {gov && gov['gov:hasName'] && (
                <p><b>Name(n):</b><span>{GOVLib.hasname(gov)}</span></p>
              )}

              {gov && gov['gov:hasType'] && (
                <p><b>ist:</b><span>{GOVLib.typ(gov)}</span></p>
              )}

              {gov && gov['gov:hasURL'] && (
                <p><b>Website:</b><span>{GOVLib.url(gov)}</span></p>
              )}

              {gov && gov['gov:isPartOf'] && (
                <p><b>übergeordnete Objekte:</b><span>{GOVLib.partOf(gov)}</span></p>
              )}

              {gov && gov['gov:note'] && (
                <p><b>Fakten:</b><span>{GOVLib.note(gov)}</span></p>
              )}
              
              {gov && gov['owl:sameAs'] && (
                <p><b>externe Referenzen:</b><span>{GOVLib.sameAs(gov)}</span></p>
              )}

            </div>
          </Fragment>
        )}

      </div>
    );

}