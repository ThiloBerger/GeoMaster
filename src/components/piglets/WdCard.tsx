import { ExpandMore } from "@mui/icons-material";
import { Accordion, AccordionDetails, AccordionSummary, Badge, Card, CardActionArea, CardActions, CardContent, CardMedia, CircularProgress } from "@mui/material";
import { FunctionComponent, ReactElement } from "react";
import { WikidataCardResult } from "../../interfaces/wikidataCityData";
import { TrueDate } from "../../util/TrueDate";
import { WikidataCardMaps } from "../GovPosition";


interface WdCardProps {
    item: WikidataCardResult[],
    label: string[],
    status: boolean,
    openPopup: Function,
    icon: ReactElement
}
export const WdCard: FunctionComponent<WdCardProps> = ({item, label, status, openPopup, icon}): ReactElement => {
    
    const show = (length: number, status: boolean): boolean => !(length === 0 && !status);
    if (!item || !show(item.length, status)) return <></>;

    return <Accordion className='accordioncardhead'>
      <AccordionSummary expandIcon={<ExpandMore />} className='accordionSum' >
        <Badge badgeContent={item.length} color="primary">{icon}</Badge>
        <span className='cardlabel'>{label[0]} <em>(Umkreis {label[1]} km)</em></span>
        {status && item.length === 0 &&<CircularProgress className='spinner'/>}
      </AccordionSummary>
      <AccordionDetails className='accordioncard'>
        {item.length !== 0 && item.map((a, i) => <Card key={i}>
          <CardActionArea href={a.ort.value} target='_blank'>
            <CardContent>
              <h1>{a.ortLabel.value}</h1>
                {a.imgLabel && <CardMedia
                  component="img"
                  height="180"
                  image={a.imgLabel.value+'?width=600px'}
                  alt={a.ortLabel.value}
                />}                      
              <p>{a.ortDescription?.value}{a.ab && `, ${(new TrueDate(a.ab.value)).getNormdate()}`}</p>
              <p>{a.subLabel?.value} ({a.subDescription?.value})</p>
            </CardContent>
          </CardActionArea>
          <CardActions>
            <WikidataCardMaps entity={a} openPopup={openPopup}/><p>{a.distNum.value.replace(/(\d+\.\d{3}).*/,'$1')} km entfernt</p>
          </CardActions>
        </Card>)}
      </AccordionDetails>
    </Accordion>;

}