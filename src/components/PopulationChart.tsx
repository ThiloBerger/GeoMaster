
import { FunctionComponent, ReactElement, useEffect, useState } from "react";
import { WikidataPopulationResult } from "../interfaces/wikidataCityData";
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface Data {
  name: string,
  pv: number
}
interface Props {
  popData: WikidataPopulationResult[] | undefined;
}
export const PopulationChart: FunctionComponent<Props> = ({popData}): ReactElement => {

  const [data, setData] = useState<Data[]>([]);
  const [count, setCount] = useState<number>(0);

  useEffect(()=>{
      const d: Data[] = [];
      if (!popData) return;
      const items = popData.filter(f => f.date);
      if (items.length > 0) {
        items.forEach(f => d.push({name: f.date.value.replaceAll(/T.*/g,''), pv: parseInt(f.population.value)}));
        setCount(items.length);
      }
      setData(d);
  },[popData]);

  if (!popData) return <></>;
  return (
    <ComposedChart
      layout="vertical"
      width={500}
      height={70 + count * 15}
      data={data}
      margin={{
        top: 20,
        right: 40,
        bottom: 20,
        left: 40
      }}
    >
      <CartesianGrid horizontal={false} strokeDasharray="3 3" />
      <XAxis type="number" tick={{fontSize: 11}}/>
      <YAxis dataKey="name" type="category" tick={{fontSize: 11}} axisLine={false} interval={0}/>
      <Bar dataKey="pv" barSize={10} fill="#b8860b"  label={{ position: 'right', fontSize: 10}}/>
    </ComposedChart>
  );
}