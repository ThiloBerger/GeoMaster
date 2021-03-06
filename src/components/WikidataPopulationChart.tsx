import { ReactElement } from 'react';
import { WikidataPopulationResult } from '../interfaces/wikidataCityData';
import { TrueDate } from '../util/TrueDate';

export interface WDPop {
    chart: ReactElement;
    last: number;
    total: number;
}

export const WikidataPopulationChart = (population: WikidataPopulationResult[]): WDPop => {

    if (population.length===0) return {chart: <></>, last: 0, total: 0 };

    const years: string[] = [];
    const pops: number[] = [];

    population.filter(f => f.date).forEach(c => {
        years.push(new TrueDate(c.date.value).getNormdate());
        pops.push(parseInt(c.population.value));
    });

    const maxPop = Math.max(...pops)
    const total = years.length;

    const reverse = (str: string) => str.split('').reverse().join('');
    const separatedDigit = (str: string) => reverse(reverse(str).replaceAll(/(\d{3})(?!$)/g,'$1.'));

    const chart: ReactElement = <ul className='pop'>{
        years.map((year, k) => 
            <li key={`wdpop-${k}`}>
                <div>{year}</div>
                <div><div style={{ width: `${pops[k]/maxPop*200}px` }}></div></div>
                <div>{separatedDigit(pops[k].toString())}</div></li>
        )
    }</ul>;
    return {chart: chart, last: pops[0], total: total};
}
