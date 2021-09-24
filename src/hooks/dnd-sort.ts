import React, { useRef, useState } from "react";

interface Position {
  x: number;
  y: number;
}

interface DnDItem<T> {
  value: T;
  key: string;
  position: Position;
  element: HTMLElement;
}

interface DnDRef<T> {
  keys: Map<T, string>;
  dndItems: DnDItem<T>[];
  canCheckHovered: boolean;
  pointerPosition: Position;
  dragElement: DnDItem<T> | null;
}

export interface DnDSortResult<T> {
  key: string;
  value: T;
  events: {
    ref: (element: HTMLElement | null) => void;
    onMouseDown: (event: React.MouseEvent<HTMLElement>) => void;
  };
}

function isHover(event: MouseEvent, element: HTMLElement): boolean {
  const { clientX, clientY } = event;
  const rect = element.getBoundingClientRect();

  return (
    clientY < rect.bottom &&
    clientY > rect.top &&
    clientX < rect.right &&
    clientX > rect.left
  );
}

export const useDnDSort = <T>(
  defaultItems: T[],
  onSort: (items: T[]) => void
): DnDSortResult<T>[] => {
  const [items, setItems] = useState(defaultItems);

  // useStateを使うこともできるが、useRefを使うことで値の変更で再描画しない
  const state = useRef<DnDRef<T>>({
    dndItems: [],
    keys: new Map(),
    dragElement: null,
    canCheckHovered: true,
    pointerPosition: { x: 0, y: 0 },
  }).current;

  // windowにイベントを直接つけているのでReact.MouseEventではない
  const onMouseMove = (event: MouseEvent) => {
    const clientX: number = event.clientX;
    const clientY: number = event.clientY;
    const dndItems: DnDItem<T>[] = state.dndItems;
    const dragElement: DnDItem<T> | null = state.dragElement;
    const pointerPosition: Position = state.pointerPosition;

    if (!dragElement) return;

    const x = clientX - pointerPosition.x;
    const y = clientY - pointerPosition.y;

    const dragStyle = dragElement.element.style;

    dragStyle.zIndex = "100";
    dragStyle.cursor = "grabbing";
    dragStyle.transform = `translate(${x}px, ${y}px)`;

    if (!state.canCheckHovered) return;

    state.canCheckHovered = false;

    setTimeout(() => (state.canCheckHovered = true), 300);

    const dragIndex = dndItems.findIndex(({ key }) => key === dragElement.key);

    const hoveredIndex = dndItems.findIndex(
      ({ element }, index) => index !== dragIndex && isHover(event, element)
    );

    if (hoveredIndex >= 0) {
      state.pointerPosition.x = clientX;
      state.pointerPosition.y = clientY;

      dndItems.splice(dragIndex, 1);
      dndItems.splice(hoveredIndex, 0, dragElement);

      const { left: x, top: y } = dragElement.element.getBoundingClientRect();
      dragElement.position = { x, y };

      const sorted = dndItems.map((v) => v.value);
      setItems(sorted);
      onSort(sorted);
    }
  };

  // windowにイベントを直接つけているのでReact.MouseEventではない
  const onMouseUp = (event: MouseEvent) => {
    const { dragElement } = state;

    if (!dragElement) return;

    const dragStyle = dragElement.element.style;

    dragStyle.zIndex = "";
    dragStyle.cursor = "";
    dragStyle.transform = "";

    state.dragElement = null;

    window.removeEventListener("mouseup", onMouseUp);
    window.removeEventListener("mousemove", onMouseMove);
  };

  return items.map((value: T): DnDSortResult<T> => {
    const key = state.keys.get(value) || Math.random().toString(16);

    state.keys.set(value, key);

    return {
      value,
      key,
      events: {
        ref: (element: HTMLElement | null) => {
          if (!element) return;

          const dndItems: DnDItem<T>[] = state.dndItems;
          const dragElement: DnDItem<T> | null = state.dragElement;
          const pointerPosition: Position = state.pointerPosition;

          // ドラッグ中の要素であっても元の位置からの移動はクリアする
          // ドラッグ中にrefは呼ばれない
          element.style.transform = "";

          const { left: x, top: y } = element.getBoundingClientRect();

          const position: Position = { x, y };

          const itemIndex = dndItems.findIndex((item) => item.key === key);

          if (itemIndex < 0) {
            return dndItems.push({ key, value, element, position });
          }

          if (dragElement?.key === key) {
            const dragX = dndItems[itemIndex].position.x - position.x;
            const dragY = dndItems[itemIndex].position.y - position.y;

            dragElement.element.style.transform = `translate(${dragX}px, ${dragY}px)`;

            pointerPosition.x -= dragX;
            pointerPosition.y -= dragY;
          }

          if (dragElement?.key !== key) {
            const item = dndItems[itemIndex];

            // 並び替え前の座標と並び替え後の座標の差分
            const x = item.position.x - position.x;
            const y = item.position.y - position.y;

            // 並び替え前の座標に配置されているように見えるようにする
            element.style.transition = "";
            element.style.transform = `translate(${x}px, ${y}px)`;

            requestAnimationFrame(() => {
              element.style.transition =
                "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
              element.style.transform = "";
            });
          }

          state.dndItems[itemIndex] = { key, value, element, position };
        },
        onMouseDown: (event: React.MouseEvent<HTMLElement>) => {
          event.preventDefault();
          const element = event.currentTarget;

          state.pointerPosition.x = event.clientX;
          state.pointerPosition.y = event.clientY;

          element.style.transition = "";
          element.style.cursor = "grabbing";

          const { left: x, top: y } = element.getBoundingClientRect();
          const position: Position = { x, y };

          state.dragElement = { key, value, element, position };

          window.addEventListener("mouseup", onMouseUp);
          window.addEventListener("mousemove", onMouseMove);
        },
      },
    };
  });
};
