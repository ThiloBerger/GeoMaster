import { Lang } from "../types/lang";
import { ListID } from "./listID";

export interface PanelProps {
    searchIds: ListID,
    onSearchIds: Function,
    openPopup?: Function,
    lang?: Lang,
    style: {
        order: number;
    }
}