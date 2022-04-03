import { FunctionComponent, ReactElement, useEffect, useState } from 'react';
import { Close }from '@mui/icons-material';
import './MapPopup.scss'

interface PopupFrameProps {
    url: string,
    open: boolean,
    close: Function,
    image?: boolean
}

export const MapPopup: FunctionComponent<PopupFrameProps> = ({
  url,
  open,
  close,
  image
}): ReactElement => {

  const [loaded,setLoaded] = useState(false)

  useEffect(() => { 
    setLoaded(false);
  }, [url, open, close]);

  const closeFrame = () => {
    close();
  };

  return open 
  ? (
    <div className='popupFrame'>
      <button onClick={closeFrame}><Close /></button>
      <div className={loaded ? '' : 'loader'}>
        <div></div>
      </div>
      <div>
        {image 
          ? <img src={url} alt='Bild' onLoad={()=>setLoaded(true)}/> 
          : <iframe id='mapframe' src={url} title="map"></iframe> 
        }
      </div>
    </div>
  ) 
  : (
    <></>
  );
};