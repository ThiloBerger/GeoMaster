import { ReactElement } from 'react';
import { GovData, GovPopulation } from '../interfaces/govRdf';

export interface GOVPop {
    chart: ReactElement;
    total: number;
}

export const GovPopulationChart = (govObject: GovData): GOVPop => {

    if (!govObject['gov:hasPopulation']) return {chart: <></>, total: 0 };

    if (!Array.isArray(govObject['gov:hasPopulation']))
        govObject['gov:hasPopulation']=[govObject['gov:hasPopulation']];

    const years: string[] = [];
    const pops: number[] = [];
    const sgo = govObject['gov:hasPopulation'].sort((a, b) => getMedianPopulation(b) - getMedianPopulation(a))
    sgo.forEach(c => {
        years.push(c['gov:PropertyForObject']['gov:timeBegin'] ? c['gov:PropertyForObject']['gov:timeBegin'] : '');
        pops.push(c['gov:PropertyForObject']['gov:value'] ? parseInt(c['gov:PropertyForObject']['gov:value']) : 0);
    });
    const maxPop = Math.max(...pops)

    const chart: ReactElement = <ul className='pop'>{
        years.map((year, idx) => 
            <li key={idx}>
                <div>{year}</div>
                <div><div style={{ width: `${pops[idx]/maxPop*200}px` }}></div></div>
                <div>{pops[idx]}</div></li>
        )
    }</ul>;
    return {chart: chart, total: years.length};
}

const getMedianPopulation = (pop: GovPopulation): number => {
    let [sum, count] = [0, 0];
    if (pop['gov:PropertyForObject']['gov:timeBegin']) {
        sum = Date.parse(pop['gov:PropertyForObject']['gov:timeBegin']) / 1000;
        count++;
    }
    if (pop['gov:PropertyForObject']['gov:timeEnd']) {
        sum += Date.parse(pop['gov:PropertyForObject']['gov:timeEnd']) / 1000;
        count++;
    }
    if (count !== 0) sum /= count;
    return sum;
}