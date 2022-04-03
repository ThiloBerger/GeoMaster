import { FunctionComponent, ReactElement } from 'react';

interface HREFProps { link: string, text: string }
export const HREF: FunctionComponent<HREFProps> = ({link, text}): ReactElement => {
    return (
        <a target='_blank' rel ='noreferrer' href={link}>{text===''?link:text}</a>
    );
}