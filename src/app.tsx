import React from "react";

import { useDnDSort, DnDSortResult } from "./hooks/dnd-sort";

const lists: string[] = Array(9)
.fill(0)
.map((_, i) => {
  return i.toString();
});

type Style<T extends HTMLElement> = React.HTMLAttributes<T>["style"];

const containerStyle: Style<HTMLDivElement> = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "space-between",
  width: "100%",
  maxWidth: "360px",
};

const cardStyle: Style<HTMLDivElement> = {
  borderRadius: "4px",
  width: "100px",
  height: "100px",
  margin: "10px",
  boxSizing: "border-box",
  border: "1px solid #000",
  display: "inline-flex",
  alignItems: "center",
  alignContent: "center",
  justifyContent: "center"
};

export const App: React.FC = () => {
  const results: DnDSortResult<string>[] = useDnDSort<string>(
    lists,
    (items) => {
      console.log(items, lists);
    }
  );
  return (
    <div style={containerStyle}>
      {results.map((item) => (
        <div key={item.key} style={cardStyle} {...item.events}>
          {item.value}
        </div>
      ))}
    </div>
  );
};
