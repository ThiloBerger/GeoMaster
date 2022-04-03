import { ReactElement } from 'react';
import { GovObject, GovPopulation } from '../interfaces/govRdf';

export interface GOVPop {
    chart: ReactElement;
    total: number;
}

export const GovPopulationChart = (govObject: GovObject): GOVPop => {

    if (!govObject['gov:hasPopulation']) return {chart: <></>, total: 0 };

    if (!Array.isArray(govObject['gov:hasPopulation'])) {
        const c = govObject['gov:hasPopulation'];
        return { 
            chart: <ul className='pop'><li>
                    <div>{c['gov:PropertyForObject']['gov:timeBegin'] ? c['gov:PropertyForObject']['gov:timeBegin'] : ''}</div>
                    <div><div style={{ width: `200px` }}></div></div>
                    <div>{c['gov:PropertyForObject']['gov:value'] ? parseInt(c['gov:PropertyForObject']['gov:value']) : 0}</div>
                    </li></ul>, 
        total: 1};
    }


    const years: string[] = [];
    const pops: number[] = [];
    const sgo = govObject['gov:hasPopulation'].sort((a, b) => {
        return getMedianPopulation(b) - getMedianPopulation(a);  //DESC
    })
    sgo.forEach(c => {
        years.push(c['gov:PropertyForObject']['gov:timeBegin'] ? c['gov:PropertyForObject']['gov:timeBegin'] : '');
        pops.push(c['gov:PropertyForObject']['gov:value'] ? parseInt(c['gov:PropertyForObject']['gov:value']) : 0);
    });
    const maxPop = Math.max(...pops)
    const total = years.length;

    const chart: ReactElement = <ul className='pop'>{
        years.map((year, k) => 
            <li key={`govpop-${k}`}>
                <div>{year}</div>
                <div><div style={{ width: `${pops[k]/maxPop*200}px` }}></div></div>
                <div>{pops[k]}</div></li>
        )
        }     
    </ul>;
    return {chart: chart, total: total};
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