import { Lang } from "../types/lang";
import { ArgGisFeatures } from "./ArgGis";
import { ListID } from "./listID";

export interface PanelProps {
    searchIds: ListID,
    onSearchIds: Function,
    openPopup?: Function,
    lang?: Lang,
    style: {
        order: number;
    },
    features?: ArgGisFeatures[],
}