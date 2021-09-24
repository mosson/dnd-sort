import React from "react";

import { useDnDSort, DnDSortResult } from "./hooks/dnd-sort";

const imageLists: string[] = Array(9)
  .fill(0)
  .map(() => {
    return `https://picsum.photos/150?${Math.floor(Math.random() * 10000)}`;
  });

type Style<T extends HTMLElement> = React.HTMLAttributes<T>["style"];

const containerStyle: Style<HTMLDivElement> = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "space-between",
  width: "100%",
  maxWidth: "500px",
};

const cardStyle: Style<HTMLDivElement> = {
  borderRadius: "4px",
  overflow: "hidden",
  display: "inline-flex",
  alignItems: "center",
  alignContent: "center"
};

const imgStyle: Style<HTMLImageElement> = {
  pointerEvents: "none",
};

export const App = () => {
  const results: DnDSortResult<string>[] = useDnDSort<string>(imageLists);
  return (
    <div style={containerStyle}>
      {results.map((item) => (
        <div key={item.key} style={cardStyle} {...item.events}>
          <img
            src={item.value}
            alt={item.value}
            style={imgStyle}
          />
        </div>
      ))}
    </div>
  );
};
