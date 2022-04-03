import { FunctionComponent, ReactElement } from "react"
import { WikiValue } from "../../interfaces/wikidataCityData"

interface WdExtraItemProps {
    item: WikiValue,
    label: string,
    openPopup: Function
}
export const WdExtraItem: FunctionComponent<WdExtraItemProps> = ({item, label, openPopup}): ReactElement => {

    if (!item) return <></>;

    return <div onClick={()=>openPopup(item.value, true)}
    data-flex style={{backgroundImage: 'url("' + item.value + '")'}}><i>{label}</i></div>;

}