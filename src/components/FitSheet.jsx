import React, { useLayoutEffect, useRef, useState } from "react";

// scales a fixed-width sheet down to fit small screens (phones) without horizontal scrolling
export default function FitSheet({ width, children }) {
  const box = useRef(null);
  const inner = useRef(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState("auto");
  useLayoutEffect(() => {
    const fit = () => {
      const s = Math.min(1, box.current.clientWidth / width);
      setScale(s);
      setHeight(inner.current.offsetHeight * s);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(box.current);
    return () => ro.disconnect();
  }, [width, children]);
  return (
    <div ref={box} style={{ width: "100%", maxWidth: width, height, margin: "0 auto" }}>
      <div ref={inner} style={{ width, transform: `scale(${scale})`, transformOrigin: "top left" }}>{children}</div>
    </div>
  );
}
