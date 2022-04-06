import { FunctionComponent, ReactElement } from "react"

interface GndItemProps {
    item: any,
    label: string,
    attr: string,
    method: Function
}
export const GndItem: FunctionComponent<GndItemProps> = ({item, label, method, attr}): ReactElement => {
    
    if (!item || item[attr] === undefined || item[attr].length === 0 ) return <></>;

    return  <p>
                <b>{label} </b>
                <span>{method(item[attr])}</span>
            </p>;
}