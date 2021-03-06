import { Dispatch, Fragment, ReactElement, SetStateAction } from 'react';
import { HREF } from '../components/piglets/Link';
import { GndSameAs, GndString } from '../interfaces/GndJson';
import { GovData, GovRdf } from '../interfaces/govRdf';
import { ListID } from '../interfaces/listID';
import { COUNTRIES_DB_DE } from '../interfaces/sprachen';
import { WikidataCardResult, WikidataCityResult, WikidataExtraResult } from '../interfaces/wikidataCityData';
import { API } from '../service/api';
import { GOVKEY } from '../types/govkey';
import { Lang } from '../types/lang';
import { TrueDate } from './TrueDate';
import { LngLat } from './WGS84';
import { typeGlobal } from '../components/Global';

export class GOV {
    static xml2json(xml: XMLDocument | any, key: string = ''): {} {
        try {
            let obj: Record<string, any> = {}
            // value zurückgeben
            if (xml.children.length === 0) {
                let attr = xml.getAttribute('rdf:resource');
                // wenn RDF-Verlinkung, dann value nachladen
                if (attr) {
                    if (key.startsWith('gov:type')) return this.govType(attr);
                    if (key.startsWith('gov:sourceRef')) return this.govSourceRef(attr);
                    if (key.startsWith('gov:ref')) return this.govRef(attr);
                    return attr
                }
                return xml.textContent;
            }
            // Recusiv durch alles mit Fallunterscheidung bei Arrays
            for (let item of xml.children) {
                const nodeName: string = item.nodeName;
                if (!obj[nodeName]) obj[nodeName] = this.xml2json(item, nodeName);
                else {
                    if (!obj[nodeName].push) obj[nodeName] = [obj[nodeName]];
                    obj[nodeName].push(this.xml2json(item, nodeName));
                }
            }
            return obj;
        } catch (e: any) {
            console.log(e.message);
            return {};
        }
    }

    /**
     * lädt RDF Infos nach und prüft zuvor, ob diese im localen Stor des
     * Webbrowsers bereits vorhanden sind bzw. legt diese dort ab.
     * @param grab Funktion um den value aus dem RDF zu holen
     * @param attr Attribut dem der value zugeordnet werden soll
     * @param url Url zur RDF-Datei
     * @returns gibt das Attribut mit zugewiesenen value zurück
     */
    private static loadfromXMLorList(grab: Function, attr: any, url: string) {
        const listtext = localStorage.getItem('urllist')
        const list = JSON.parse(listtext ? listtext : '{}');
        if (!list.hasOwnProperty(attr)) {
            // RDF nachladen
            const xml = this.getRdf(url);
            if (xml) {
                // value aus dem RDF holen
                list[attr] = grab(xml, attr);
                attr = [list[attr], attr];
            }
        }
        else attr = [list[attr], attr];
        localStorage.setItem('urllist', JSON.stringify(list));
        return attr;
    }

    private static govSourceRef(attr: any) {
        attr = this.loadfromXMLorList(this.grabSource, attr,
            attr.replace(/.*\/(.*)$/, 'http://gov.genealogy.net/semanticWeb/about/$1'));
        return attr;
    }

    private static govType(attr: any) {
        attr = this.loadfromXMLorList(this.grabType, attr, attr)
        return attr;
    }

    private static govRef(attr: any) {
            attr = this.loadfromXMLorList(this.grabReference, attr, attr + '/about.rdf')
        return attr;
    }

    private static grabReference = (xml: XMLDocument, value: string): string => {
        let inhalt = value;
        const elements = xml.querySelectorAll('hasName PropertyName language');
        elements.forEach(el => {
            if (el.textContent === 'deu' && el.parentElement){
                let x = el.parentElement.querySelector('value');
                inhalt = x?.textContent ? x.textContent : value;
            }
        });
        return inhalt;
    }

    private static grabSource = (xml: XMLDocument, value: string): string => {
        const element = xml.querySelector('CreativeWork > name');
        return element?.textContent ? element.textContent : '';
    }

    private static grabType = (xml: XMLDocument, value: string): string => {
        const elements = xml.querySelectorAll('*');
        let inhalt = value;
        elements.forEach(el => {
            if (el.getAttribute('rdf:about') === value) {
                const item = el.getElementsByTagName('rdfs:label')
                for (let it of Array.from(item))
                    if (it.getAttribute('xml:lang') === 'de') inhalt = it.innerHTML;
            }
        });
        return inhalt;
    }

    static getRdf(url: string) {
        const xmlhttp=new XMLHttpRequest();
        xmlhttp.overrideMimeType('text/xml');
        xmlhttp.open('GET', url, false);
        xmlhttp.send(null);
        return xmlhttp.responseXML;
    }

    static jsonToGOV = (json: {}): GovData =>
      (json as GovRdf)['rdf:RDF']['rdf:Description']['foaf:primaryTopic']['gov:GovObject'];

}

export class LOB {
    static extractID(item: GndSameAs[]): ReactElement[] {
        return item.map(c => (
          <i key={c.id}>
              {c.collection.publisher}{' '}
              {c.collection.abbr ? ` (${c.collection.abbr})` : ''}<br />
              <HREF link={c.id} text='' />
          </i>
        ));
      };
      static extractLinkArray(item: GndString[]): ReactElement[] {
        return item.map(a => (
          <i key={a.id}>
            <HREF link={a.id} text={a.label} />
            <br></br>
          </i>
        ));
      };
      static extractString(item: string[]): ReactElement {
        if (item.length === 1) return <span className='alternate'><em>{item[0]}</em></span>;
        return <span className='alternate'>{item.map((s,i) => <em key={i}>{s}</em>)}</span>
      }; 
      static extractStringAsBlock(item: string[]): ReactElement[] {

        const out: string[] = [];

        item.forEach( s => {
          const arr = s.split(',');
          arr.forEach( s2 => {
            const arr2 = s2.split(';');
            arr2.forEach(x => out.push(x))
          })
        });

        return out.map((s, i) => <i key={`esab${i}`}>{s}</i>);
      };

      static pointToCoordinate(point: string): string {
        const float = (x: string): number => parseFloat(x)
        const coord = point.split(' ').filter(float).map(float);
        return `${coord[1] < 0?'S':'N'}${coord[1] < 0?(coord[1]*-1).toFixed(7):coord[1].toFixed(7)} ${coord[0] < 0?'W':'E'}${coord[0] < 0?(coord[0]*-1).toFixed(7):coord[0].toFixed(7)}`;
      }

      static pointToLngLat(point: string): LngLat {
        const float = (x: string): number => parseFloat(x)
        const coord = point.split(' ').filter(float).map(float);
        return [coord[0], coord[1]];
      }

}

export class GOVLib {
  static ags(govObj: GovData): ReactElement[] {
    const arr = govObj["gov:hasMunicipalityId"];
    const items = Array.isArray(arr) ? arr : [arr];
    return items.map((c, i) => (
      <i key={`mid${i}`}>{c["gov:PropertyForObject"]["gov:value"]}</i>
    ));
  }

  static url(govObj: GovData): ReactElement[] {
    const arr = govObj["gov:hasURL"];
    const items = Array.isArray(arr) ? arr : [arr];
    return items.map((c, i) =>
      c["gov:PropertyForObject"]["gov:value"] ? (
        <i key={`url${i}`}>
          {<HREF link={c["gov:PropertyForObject"]["gov:value"]} text={""} />}
        </i>
      ) : (
        <Fragment></Fragment>
      )
    );
  }

  static hasname(govObj: GovData): ReactElement[] {
    const arr = govObj["gov:hasName"];
    const items = Array.isArray(arr) ? arr : [arr];
    return items.map((c, i) => (
      <i key={`hasname${i}`}>
        {c["gov:PropertyName"]["gov:value"]}
        <em>
          {c["gov:PropertyName"]["gov:timeBegin"] &&
            ` ab ${c["gov:PropertyName"]["gov:timeBegin"]}`}
        </em>
        <em>
          {c["gov:PropertyName"]["gov:timeEnd"] &&
            ` bis ${c["gov:PropertyName"]["gov:timeEnd"]}`}
        </em>
        <em>
          {c["gov:PropertyName"]["gov:language"] &&
            `, (${c["gov:PropertyName"]["gov:language"]}, ${
              COUNTRIES_DB_DE.find(
                (el) =>
                  c["gov:PropertyName"]["gov:language"].toLowerCase() ===
                  el.iso639
              )?.sprache
            })`}
        </em>
      </i>
    ));
  }

  static typ(govObj: GovData): ReactElement[] {
    const arr = govObj["gov:hasType"];
    const items = Array.isArray(arr) ? arr : [arr];
    return items.map((c, i) => (
      <i key={`typ${i}`}>
        {c["gov:PropertyType"]["gov:type"][0]}
        <em>
          {c["gov:PropertyType"]["gov:timeBegin"] &&
            ` ab ${c["gov:PropertyType"]["gov:timeBegin"]}`}
        </em>
        <em>
          {c["gov:PropertyType"]["gov:timeEnd"] &&
            ` bis ${c["gov:PropertyType"]["gov:timeEnd"]}`}
        </em>
      </i>
    ));
  }

  static partOf(govObj: GovData): ReactElement[] {
    const arr = govObj["gov:isPartOf"];
    const items = Array.isArray(arr) ? arr : [arr];
    return items.map((c, i) => (
      <i key={`partof${i}`}>
        <HREF
          link={c["gov:Relation"]["gov:ref"][1]}
          text={c["gov:Relation"]["gov:ref"][0]}
        />
        <em>
          {c["gov:Relation"]["gov:timeBegin"] &&
            ` ab ${c["gov:Relation"]["gov:timeBegin"]}`}
        </em>
        <em>
          {c["gov:Relation"]["gov:timeEnd"] &&
            ` bis ${c["gov:Relation"]["gov:timeEnd"]}`}
        </em>
      </i>
    ));
  }

  static sameAs(govObj: GovData): ReactElement[] {
    const arr = govObj["owl:sameAs"];
    const items = Array.isArray(arr) ? arr : [arr];
    return items.map((c, i) => (
      <i key={`sameas${i}`}>
        <HREF link={c} text={""} />
      </i>
    ));
  }

  static note(govObj: GovData): ReactElement[] {
    const arr = govObj["gov:note"];
    const items = Array.isArray(arr) ? arr : [arr];
    return items.map((c, i) => (
      <i key={`note${i}`}>{c["gov:Note"]["gov:noteText"]}</i>
    ));
  }


  // wiki-de.genealogy.net/GOV/FAQ_zur_Dateneingabe#GOV-Kennung
  // wiki-de.genealogy.net/GOV/Dateneingabehilfe#Makro_zur_Berechnung_des_Maidenhead-Locators
  static getMaidenheadLocator = (lon: number, lat: number): string => {

    const ge = lon + 180;
    const te = lat + 90;
    const z1 = String.fromCharCode(65 + Math.floor(ge / 20));
    const z2 = String.fromCharCode(65 + Math.floor(te / 10));

    const g3 = Math.floor(ge / 2) - Math.floor(ge / 20) * 10;
    const g4 = Math.floor(te) - Math.floor(te / 10) * 10;

    const lm = (lon - Math.floor(lon)) * 60;
    const bm = (lat - Math.floor(lat)) * 60;

    const g5 = Math.floor(lm / 5) + 12 * Math.floor(ge - 2 * Math.floor(ge / 2));
    const g6 = Math.floor(bm / 2.5);
    const z5 = String.fromCharCode(65 + g5);
    const z6 = String.fromCharCode(65 + g6);

    return `${z1}${z2}${g3}${g4}${z5}${z6}`;
  }

  static getGovID = (ort: string, lngLat: LngLat, plz: string = ''): string[] => {
    const ids: string[] = [];
    const name = ort.toUpperCase().replaceAll(/^BAD\s/g,'').replaceAll(/(\s+)?\(.*\)/g,'');
    const prefix = (name.slice(0,3) + name.slice(-3))
    const sufix = this.getMaidenheadLocator(lngLat[0], lngLat[1]);
    const sufixPlz = plz.length !== 5 ? '' : `_${plz}`;
    ids.push(prefix + sufix);
    ids.push(prefix + sufixPlz);
    let i = 0;
    while(i++<9)ids.push(prefix + sufix[0] +i + sufix.slice(2,6));
    return ids;
  }

  static getGovLocatorId = (ort: string, lngLat: LngLat): string => {
    const name = ort.replaceAll('ß', 's')
      .toUpperCase()
      .replaceAll(/^BAD\s/g,'')
      .replaceAll(/(\s+)?\(.*\)/g,'')
      .replaceAll('Ä','A')
      .replaceAll('Ö','O')
      .replaceAll('Ü','U');
    const prefix = (name.slice(0,3) + name.slice(-3))
    const sufix = this.getMaidenheadLocator(lngLat[0], lngLat[1]);
    return prefix + sufix;
  }

}

export class WD {

  static readId = async (from: GOVKEY, id: string, searchIds: ListID, onSearchIds: Function) => {
    await API.govSearchIDWithKey(from, id).then((response) => {
      const govId = response.url.replaceAll(/^(.*\/)/g, '');
      if (govId !== 'extended') {
        searchIds.gov.id = govId;
        onSearchIds({...searchIds});
      }
    });
  };

  static testGovId = (extra: WikidataExtraResult, lngLat: LngLat, searchIds: ListID,
    onSearchIds: Function, setGovLocatorId: Dispatch<SetStateAction<string>>) => {
    const govSolvedId = GOVLib.getGovLocatorId(extra.ort.value, lngLat);
    console.log('berechnete GOVid', govSolvedId);
    API.govTestId(govSolvedId).then(response => {
      const test = response.url.replaceAll(/^(.*\/)/g, '');
      if (test === govSolvedId) {
        setGovLocatorId(response.url);
        let counter = 0;
        const check = setInterval(() => {
          if (counter > 5 && searchIds.gov.id === '') {
            searchIds.gov.id = govSolvedId;
            onSearchIds({ ...searchIds });
          }
          counter++;
          if(counter > 50 || searchIds.gov.id !== '') clearInterval(check);
        }, 200);
      }
    });  
  }

  static loadCards = (setWdStatus: Dispatch<SetStateAction<boolean>>,
    setWdItem: Dispatch<SetStateAction<WikidataCardResult[]>>, logLabel: string,
    radius: number, wdItemId: string, lang: Lang, lngLat: LngLat, global: typeGlobal) => {
      setWdStatus(true);
      API.wdCard(lang, lngLat, radius, wdItemId).then(data => {
        console.log(`Wikidata ${logLabel}:`, data);
        setWdStatus(false);
        setWdItem(data.results.bindings);
        global.wikidata = { ...global.wikidata, [logLabel]: data.results.bindings };
      }).catch (
        err => setWdStatus(false)
      );
  } 

  static typ(items: WikidataCityResult[]): ReactElement[] {
    return items.filter(f => f.propertyLabel).map((c, i) => (
      <i key={`typ${i}`}>
        {WD.checkIsDate(c.propertyLabel.value)}
        {c.ab && <em>{` ab ${c.ab.value}`}</em>}
        {c.bis && <em>{` bis ${c.bis.value}`}</em>}
      </i>
    ));
  };

  static checkIsDate = (date: string): string => {
    const pattern = /-?\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/g;
    if (!pattern.test(date)) return date;
    return date.replaceAll(pattern, new TrueDate(date).getNormdate());
  }

}