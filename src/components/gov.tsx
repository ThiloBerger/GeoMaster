import { ExpandMore, GpsFixed } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Badge } from '@mui/material';
import { Fragment, FunctionComponent, ReactElement, useContext, useEffect, useState } from 'react';
import { GovData } from '../interfaces/govRdf';
import { PanelProps } from '../interfaces/panelProps';
import { API } from '../service/api';
import { GOV, GOVLib } from '../util/util';
import { LngLat } from '../util/WGS84';
import { Global } from './Global';
import { GovAreaChart } from './GovAreaChart';
import { GOVPop, GovPopulationChart } from './GovPopulationChart';
import { GovMaps, GovPosition } from './GovPosition';
import { HREF } from './piglets/Link';





export const Gov: FunctionComponent<PanelProps> = ({style, searchIds, onSearchIds, openPopup = () => {}}): ReactElement => {

    const global = useContext(Global);
    
    const [govPop, setGovPop] = useState<GOVPop>({} as GOVPop);
    const [govPos, setGovPos] = useState<ReactElement>(<></>);
    const [govArea, setGovArea] = useState<ReactElement>(<></>);
    const [govData, setGovData] = useState<GovData>({} as GovData);

    useEffect(() => {

        if (searchIds.gov.apiCall || searchIds.gov.id === '') return;
        console.log('GOV USEEFFECT: ', searchIds.gov.id)
        global.gov.id = searchIds.gov.id;
        searchIds.gov.apiCall = true;
        searchIds.gov.status = true;
        onSearchIds({...searchIds});

        API.govEntryById(searchIds.gov.id).then( async data => {
            const json = GOV.xml2json(data);
            const govObj = GOV.jsonToGOV(json);
            console.log('GOV USEEFFECT: ', govObj);
            setGovData(govObj);
            global.gov.data = govObj;
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

              searchIds.gov.status = false;
              onSearchIds({...searchIds});

        })
        
    }, [searchIds, onSearchIds, global]);



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
            {searchIds.gov.id !== '' && govPop.chart && govPop.total > 0 && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />} className='accordionSum' >
                  <Badge badgeContent={govPop.total} color="primary"><div className='icon population'/></Badge><span>Einwohner</span>
                </AccordionSummary>
                <AccordionDetails>{govPop.chart}</AccordionDetails>
              </Accordion>
            )}

            {(govData?.['gov:position'] || govData?.['gov:hasArea']) && searchIds.gov.id !== '' && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />} className='accordionSum' >
                  <GpsFixed /><span>Geografische Informationen</span>
                </AccordionSummary>
                <AccordionDetails className='geo'>
                  {govData['gov:hasArea'] && <p style={{textAlign:'center'}}>Fläche in Km<sup>2</sup></p>}
                  {govArea}
                  {govPos}
                  {govData['gov:position'] && <GovMaps entity={govData} openPopup={openPopup}/>}
                </AccordionDetails>
              </Accordion>
            )}

            <div className='tablelist'>
              {govData?.['gov:hasMunicipalityId'] && (
                <p><b>amtlicher Gemeindeschlüssel:</b><span>{GOVLib.ags(govData)}</span></p>
              )}

              {govData?.['gov:hasName'] && (
                <p><b>Name(n):</b><span>{GOVLib.hasname(govData)}</span></p>
              )}

              {govData?.['gov:hasType'] && (
                <p><b>ist:</b><span>{GOVLib.typ(govData)}</span></p>
              )}

              {govData?.['gov:hasURL'] && (
                <p><b>Website:</b><span>{GOVLib.url(govData)}</span></p>
              )}

              {govData?.['gov:isPartOf'] && (
                <p><b>übergeordnete Objekte:</b><span>{GOVLib.partOf(govData)}</span></p>
              )}

              {govData?.['gov:note'] && (
                <p><b>Fakten:</b><span>{GOVLib.note(govData)}</span></p>
              )}
              
              {govData?.['owl:sameAs'] && (
                <p><b>externe Referenzen:</b><span>{GOVLib.sameAs(govData)}</span></p>
              )}

            </div>
          </Fragment>
        )}

      </div>
    );

}