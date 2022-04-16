import { TextField } from "@mui/material";
import { ReactElement, useContext, useState } from "react";
import { Global } from "../Global";

interface SearchProps<T> {
  label: string,
  items: T[],
  getId: (item: T) => string,
  getTitle: (item: T) => string,
  getDescription: (item: T) => string,
  onChangeSearch: (search: string) => void,
  onClickSearch: (search: string) => void,
}
export const SearchList = <T extends {}>({
    label,
    items,
    getId,
    getTitle,
    getDescription,
    onChangeSearch,
    onClickSearch,
}: SearchProps<T>): ReactElement => {
  
  const global = useContext(Global);

  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');

  const onClickList = (identifier: string, title: string): void => {
    console.log('### Du hast gesucht: ', title);
    global.search = title;
    const input = document.activeElement as HTMLInputElement;
    input.blur();
    setSearch(title);
    onClickSearch(identifier);
  }

  const onChangeInput = (text: string): void => {
    setSearch(text);
    onChangeSearch(text);
  }

  return (
    <div className="search" onFocus={() => setShowSearch(true)} onBlur={() => setShowSearch(false)}>
      <TextField label={label} variant="filled"  size="small" autoComplete="off"
        onChange={e => onChangeInput(e.target.value)}
        value={search}
      />
      <div
        className={showSearch && search.length !== 0 ? "pool" : "hidden"}
        onMouseDown={(event) => event.preventDefault()} >
        {items?.map((item, i) => (
          <div key={i} onClick={() => onClickList(getId(item), getTitle(item))}>
            <p>{getTitle(item)}</p>
            <p>{getDescription(item)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
