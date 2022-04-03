import { ReactElement } from 'react';
import { GovArea, GovObject } from '../interfaces/govRdf';

export const GovAreaChart = (govObject: GovObject): ReactElement => {

    if (!govObject['gov:hasArea']) return (<></>);

    if (!Array.isArray(govObject['gov:hasArea'])) {
        const c = govObject['gov:hasArea'];
        return (<ul className='pop'>
            <li>
                <div>{c['gov:PropertyForObject']['gov:timeBegin'] ? c['gov:PropertyForObject']['gov:timeBegin'] : ''}</div>
                <div><div style={{ width: `200px` }}></div></div>
                <div>{c['gov:PropertyForObject']['gov:value'] ? parseInt(c['gov:PropertyForObject']['gov:value']) : 0}</div></li>
        </ul>);
    }

    const years: string[] = [];
    const pops: number[] = [];
    const sgo = govObject['gov:hasArea'].sort((a, b) => {
        return getMedianDate(b) - getMedianDate(a);  //DESC
    })
    sgo.forEach(c => {
        years.push(c['gov:PropertyForObject']['gov:timeBegin'] ? c['gov:PropertyForObject']['gov:timeBegin'] : '');
        pops.push(c['gov:PropertyForObject']['gov:value'] ? parseInt(c['gov:PropertyForObject']['gov:value']) : 0);
    });
    const maxPop = Math.max(...pops)


    return (<ul className='pop'>{
        years.map((year, k) => 
            <li key={`govpop-${k}`}>
                <div>{year}</div>
                <div><div style={{ width: `${pops[k]/maxPop*200}px` }}></div></div>
                <div>{pops[k]}</div></li>
        )
        }     
    </ul>);
}

const getMedianDate = (obj: GovArea): number => {
    let [sum, count] = [0, 0];
    if (obj['gov:PropertyForObject']['gov:timeBegin']) {
        sum = Date.parse(obj['gov:PropertyForObject']['gov:timeBegin']) / 1000;
        count++;
    }
    if (obj['gov:PropertyForObject']['gov:timeEnd']) {
        sum += Date.parse(obj['gov:PropertyForObject']['gov:timeEnd']) / 1000;
        count++;
    }
    if (count !== 0) sum /= count;
    return sum;
}