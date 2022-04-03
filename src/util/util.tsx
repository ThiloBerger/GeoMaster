import { Fragment, ReactElement } from 'react';
import { HREF } from '../components/piglets/Link';
import { GovObject, GovRdf } from '../interfaces/govRdf';
import { LobidString, LobidSameAs } from '../interfaces/lobidJson';
import { COUNTRIES_DB_DE } from '../interfaces/sprachen';
import { WikidataCityResult, WikiDate } from '../interfaces/wikidataCityData';
import { LngLat } from './WGS84';

export class GOV {
    static xml2json(xml: XMLDocument | any, key: string = ''): {} {
        try {
            let obj: { [index: string]: any } = {}
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

    static jsonToGOV(json: {}): GovObject {
        return (json as GovRdf)['rdf:RDF']['rdf:Description']['foaf:primaryTopic']['gov:GovObject'];
    }
}

export class LOB {
    static extractID(item: LobidSameAs[]): ReactElement[] {
        return item.map(c => (
          <i key={c.id}>
              {c.collection.publisher}{' '}
              {c.collection.abbr ? ` (${c.collection.abbr})` : ''}<br />
              <HREF link={c.id} text='' />
          </i>
        ));
      };
      static extractLinkArray(item: LobidString[]): ReactElement[] {
        return item.map(a => (
          <i key={a.id}>
            <HREF link={a.id} text={a.label} />
            <br></br>
          </i>
        ));
      };
      static extractString(item: string[]): ReactElement {
        if (item.length === 1) return <p className='alternate'><em>item[0]</em></p>;
/*        let x = '';
         item.forEach((e) => (x += `${e} ─ `));
        return x.replace(/─ $/g, ''); */
        return <p className='alternate'>{item.map((s,i) => <em key={i}>{s}</em>)}</p>
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

        return out.map((s, i) => (
            <i key={`esab${i}`}>
              {s}
            </i>
        ))};

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
  static ags(govObj: GovObject): ReactElement[] {
    const arr = govObj["gov:hasMunicipalityId"];
    const items = Array.isArray(arr) ? arr : [arr];
    return items.map((c, i) => (
      <i key={`mid${i}`}>{c["gov:PropertyForObject"]["gov:value"]}</i>
    ));
  }

  static url(govObj: GovObject): ReactElement[] {
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

  static hasname(govObj: GovObject): ReactElement[] {
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

  static typ(govObj: GovObject): ReactElement[] {
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

  static partOf(govObj: GovObject): ReactElement[] {
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

  static sameAs(govObj: GovObject): ReactElement[] {
    const arr = govObj["owl:sameAs"];
    const items = Array.isArray(arr) ? arr : [arr];
    return items.map((c, i) => (
      <i key={`sameas${i}`}>
        <HREF link={c} text={""} />
      </i>
    ));
  }

  static note(govObj: GovObject): ReactElement[] {
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
    const name = ort.toUpperCase().replaceAll(/^BAD\s/g,'').replaceAll(/(\s+)?\(.*\)/g,'');
    const prefix = (name.slice(0,3) + name.slice(-3))
    const sufix = this.getMaidenheadLocator(lngLat[0], lngLat[1]);
    return prefix + sufix;
  }

}

export class WikidataLib {
  static typ(items: WikidataCityResult[]): ReactElement[] {
    return items.filter(f => f.propertyLabel).map((c, i) => (
      <i key={`typ${i}`}>
        {c.propertyLabel.value}
        <em>{c.ab && ` ab ${WikidataLib.getWikiDate(c.ab)}`}</em>
        <em>{c.bis && ` bis ${WikidataLib.getWikiDate(c.bis)}`}</em>
      </i>
    ));
  };
  static getWikiDate = (p: WikiDate): string =>{
    if (p && /^[\d-\\.]+$/.test(p.value)) {
      if (p.value.startsWith('-')) return p.value.substring(1) + ' (BC)';
      return p.value;
    } 
    return  '';
  }
}