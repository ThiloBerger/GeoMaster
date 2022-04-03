import { Fragment, FunctionComponent, ReactElement, useEffect, useState } from 'react';
import { getGettyNoteAndNames, getGettyPlaceTypes } from '../service/api';
import { PanelProps } from '../interfaces/panelProps';

import './getty.scss';
import { GettyItem } from '../interfaces/gettyJson';
import { COUNTRIES_DB_DE } from '../interfaces/sprachen';
import { HREF } from './piglets/Link';
import { AutoStories, ExpandMore, FactCheck, Language } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';


export const Getty: FunctionComponent<PanelProps> = ({style, searchIds, onSearchIds}): ReactElement => {
    
  const [data, setData] = useState<GettyItem[]>([]);
  const [places, setPlaces] = useState<GettyItem[]>([]);

    useEffect(() => {

      if (searchIds.getty.apiCall || searchIds.getty.id === '') return;
      console.log('Getty USEEFFECT: ', searchIds.getty.id);
      searchIds.getty.apiCall = true;
      searchIds.getty.status = true;
      onSearchIds({...searchIds});

      getGettyNoteAndNames(searchIds.getty.id).then(async (data) => {
        console.log('Getty USEEFFECT 1: ', data.results.bindings)
        setData(data.results.bindings);
      });
      getGettyPlaceTypes(searchIds.getty.id).then(async (data) => {
        const allPlaces = data.results.bindings;
        const objID: string[] = [];
        allPlaces.forEach(place => {
          const idx = objID.findIndex(s => place.objectID && s === place.objectID.value);
          if (idx === -1) {
            if (place.objectID) objID.push(place.objectID.value);
            return;
          }
          delete place.objectID;
        })
        console.log('Getty USEEFFECT 2: ', allPlaces)
        setPlaces(allPlaces);
          
        searchIds.getty.status = false;
        onSearchIds({...searchIds});
      });
      
    }, [searchIds, onSearchIds]);

    return (
      <div className='getty panel' style={style}>
        <div className='search'>
          <p>Getty TGN wird automatisch durchsucht, sobald eine Getty-ID vorliegt.</p>
        </div>
        <h3>getty.edu <a href='https://www.getty.edu/research/tools/vocabularies/tgn/index.html' target='_blank' rel='noreferrer'>GETTY TGN</a>
          <br />
          <span>GETTY THESAURUS of GEOGRAPHIC NAMES</span>
        </h3>
        {searchIds.getty.id !== '' && (
          <Fragment>
            <p>
              <strong>Getty ID: </strong>
              <HREF link={`https://www.getty.edu/vow/TGNFullDisplay?find=&place=&nation=&english=Y&subjectid=${searchIds.getty.id}`} text={searchIds.getty.id}/>
            </p>
            
            {data.filter(f=>f.lab).length > 0 && (
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  className='accordionSum'
                >
                  <Language /><span>andere Namen und Sprachvarianten ({data.filter(f=>f.lab).length})</span>
                </AccordionSummary>
                <AccordionDetails className='names'>
                  <div className='geonameslist'>
                    {
                      data.filter(f=>f.lab).map((s, i) => 
                        <p key={`name${i}`}>
                          <b>{s.lab.value}</b>
                          <span>
                            <i>
                            {s.comment && <em>{`, ${s.comment.value}`}</em>}
                            {s.historic && <em>{` (${s.historic.value})`}</em>}
                            {s.lab['xml:lang'] && <em>{` (${s.lab['xml:lang']}) ${COUNTRIES_DB_DE.find(el => s.lab['xml:lang'].toLowerCase() === el.iso639)?.sprache}`}</em>}
                            <em>&nbsp;</em></i>
                          </span>
                        </p>
                      )
                    }
                  </div>
                </AccordionDetails>
              </Accordion>
            )}

            {data.filter(f=>f.ScopeNote).length > 0 && (
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  className='accordionSum'
                >
                  <AutoStories /><span>Note\Summary:</span>
                </AccordionSummary>
                <AccordionDetails className='names'>
                  <div className='facts lh14'>
                    {data.filter(f=>f.ScopeNote).map((note, i) => 
                      <p key={`note${i}`} className='factsentry'>
                        {note.ScopeNote.value}
                      </p>
                    )}
                  </div>
                </AccordionDetails>
              </Accordion>
            )}

            {data.filter(f=>f.lab).length > 0 && (
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  className='accordionSum'
                >
                  <FactCheck /><span>Facts:</span>
                </AccordionSummary>
                <AccordionDetails className='names'>
                  <div className='facts'>
                    {places.filter(f=>f.objectID && f.comment).map((fact, i) => 
                      <p key={`facts${i}`} className='factsentry'>
                        <strong>{fact.object.value} </strong>
                        {fact.comment.value}
                      </p>
                    )}  
                  </div>
                </AccordionDetails>
              </Accordion>
            )}

          </Fragment>
        )}
      </div>
    );

}



    





