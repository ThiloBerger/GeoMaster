import { ReactElement } from 'react';
import { ArgGisFeatures } from '../interfaces/ArgGis';

export interface WDPLZPop {
    chart: ReactElement;
    sum: string;
    total: number;
}

export const WikidataPopulationPLZChart = (population: ArgGisFeatures[]): WDPLZPop => {

    if (population.length===0) return {chart: <></>, sum: '', total: 0 };

    const plz: string[] = [];
    const pops: number[] = [];

    population.forEach(c => {
        plz.push(c.attributes.plz);
        pops.push(c.attributes.einwohner);
    });

    const maxPop = Math.max(...pops)
    const sum = pops.reduce((a, b) => a + b, 0);
    const total = plz.length;

    const reverse = (str: string) => str.split('').reverse().join('');
    const separatedDigit = (str: string) => reverse(reverse(str).replaceAll(/(\d{3})(?!$)/g,'$1.'));

    const chart: ReactElement = <ul className='pop'>{
        plz.map((plz, k) => 
            <li key={`plzpop-${k}`}>
                <div>{plz}</div>
                <div><div style={{ width: `${pops[k]/maxPop*200}px` }}></div></div>
                <div>{separatedDigit(pops[k].toString())}</div></li>
        )
    }</ul>;
    return {chart: chart, sum: separatedDigit(sum.toString()), total: total};
}