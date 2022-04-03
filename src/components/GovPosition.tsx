import { FunctionComponent, ReactElement } from 'react';
import { GeonameById } from '../interfaces/geonamesSearch';
import { GovObject, WGS84Point } from '../interfaces/govRdf';
import { WikidataArchaelogResult, WikidataExtraResult } from '../interfaces/wikidataCityData';
import { WGS84 } from '../util/WGS84';
import { Button } from '@mui/material';
import { Map } from '@mui/icons-material';

interface GovMapsProps {
    entity: GovObject,
    openPopup: Function
}
export const GovMaps: FunctionComponent<GovMapsProps> = ({entity, openPopup}): ReactElement => {
    if (!entity['gov:position']) return (<></>);
    const point= entity['gov:position']['wgs84:Point']
    return <div className='mapbutton'><Button onClick={() => openPopup(`https://maps.google.com/maps?q=${toDeg(point)}&t=&z=11&ie=UTF8&iwloc=en&output=embed`)}><Map /> Karte</Button></div>
}
export const GovPosition = (govObject: GovObject): ReactElement => {
    
    if (!govObject['gov:position']) return (<></>);

    const point= govObject['gov:position']['wgs84:Point']

    return (
        <div className='pos'>
            <p>Geographische Position (WGS84) </p>
            <p>{toDeg(point)}</p>
            <p>{toDeg2(point)}</p>
            <p>{utm(point)}</p>
        </div>
    );
}

interface WikiDataMapsProps {
    entity: WikidataExtraResult,
    openPopup: Function
}
export const WikidataMaps: FunctionComponent<WikiDataMapsProps> = ({entity, openPopup}): ReactElement => {
    if (!entity.lat) return (<></>);
    const point: WGS84Point = {'wgs84:lon': entity.lon.value, 'wgs84:lat': entity.lat.value};
    return <div className='mapbutton'><Button onClick={() => openPopup(`https://maps.google.com/maps?q=${toDeg(point)}&t=&z=11&ie=UTF8&iwloc=en&output=embed`)}><Map /> Karte</Button></div>;
}
export const WikiDataPosition = (extra: WikidataExtraResult): ReactElement => {
    
    if (!extra.lat) return (<></>);

    const point: WGS84Point = {'wgs84:lon': extra.lon.value, 'wgs84:lat': extra.lat.value};

    return (
        <div className='pos'>
            <p>Geographische Position (WGS84)</p>
            <p>{toDeg(point)}</p>
            <p>{toDeg2(point)}</p>
            <p>{utm(point)}</p>
        </div>
    );
}

interface WikiDataArchealogMapProps {
    entity: WikidataArchaelogResult,
    openPopup: Function
}
export const WikidataArchealogMaps: FunctionComponent<WikiDataArchealogMapProps> = ({entity, openPopup}): ReactElement => {
    if (!entity.lat) return (<></>);
    const point: WGS84Point = {'wgs84:lon': entity.lon.value, 'wgs84:lat': entity.lat.value};
    return <div className='mapbutton'><Button onClick={() => openPopup(`https://maps.google.com/maps?q=${toDeg(point)}&t=&z=9&ie=UTF8&iwloc=en&output=embed`)}><Map /> Karte</Button></div>;
}


export const GeonamesPosition = (entity: GeonameById): ReactElement => {
    
    if (!entity.lat) return (<></>);

    const point: WGS84Point = {'wgs84:lon': entity.lng, 'wgs84:lat': entity.lat};

    return (
        <div className='pos'>
            <p>Geographische Position (WGS84)</p>
            <p>{toDeg(point)}</p>
            <p>{toDeg2(point)}</p>
            <p>{utm(point)}</p>
        </div>
    );
}
interface GeonamesMapsProps {
    entity: GeonameById,
    openPopup: Function
}
export const GeonamesMaps: FunctionComponent<GeonamesMapsProps> = ({entity, openPopup}): ReactElement => {
    if (!entity.lat) return (<></>);
    const point: WGS84Point = {'wgs84:lon': entity.lng, 'wgs84:lat': entity.lat};
    return <div className='mapbutton'><Button  onClick={() => openPopup(`https://maps.google.com/maps?q=${toDeg(point)}&t=&z=11&ie=UTF8&iwloc=en&output=embed`)}><Map /> Karte</Button></div>
}

export function toDeg(point: WGS84Point): string {
    const lon = parseFloat(point['wgs84:lon']);
    const lat = parseFloat(point['wgs84:lat']);
    return `${lat<0?'S':'N'} ${lat.toFixed(7).replace('-','')}° ${lon<0?'W':'E'} ${lon.toFixed(7).replace('-','')}°`;
}
export function toDeg2(point: WGS84Point): string {
    const lon = parseFloat(point['wgs84:lon']);
    const lat = parseFloat(point['wgs84:lat']);
    const lonA = Math.floor(lon);
    const lonB = (lon-lonA)*60;
    const latA = Math.floor(lat);
    const latB = (lon-lonA)*60;
    return `${latA<0?'S':'N'} ${latA.toString().padStart(2, '0').replace('-','')}° ${latB.toFixed(3)}' ${lonA<0?'W':'E'} ${lonA.toString().padStart(3, '0').replace('-','')}° ${lonB.toFixed(3)}'`;
}
export function utm (point: WGS84Point): string {
    const lon = parseFloat(point['wgs84:lon']);
    const lat = parseFloat(point['wgs84:lat']);    
    const utm = WGS84.convertLatLngToUtm(lat, lon)
    return `${utm.ZoneNumber}${utm.ZoneLetter} ${utm.Easting} ${utm.Northing}`;
}

