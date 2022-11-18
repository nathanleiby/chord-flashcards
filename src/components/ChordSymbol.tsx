import { BbFormat } from "bb-format";
import _ from "lodash";
import { useEffect, useRef, useState } from "react";
import "./ChordSymbol.css";

export interface ChordSymbolProps {
  chordSymbol: string;
}

const FONT_SIZE = 32;
export default function ChordSymbol(props: ChordSymbolProps) {
  const { chordSymbol } = props;
  const [id] = useState(_.uniqueId("chord-symbol-"));
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = document.getElementById(id) as HTMLCanvasElement;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.font = `${FONT_SIZE}px Noto`;

    const formatter = new BbFormat(ctx);

    formatter.fillChordSymbol(chordSymbol, 0, Math.ceil(FONT_SIZE / 2));
  }, [chordSymbol]);

  return (
    <canvas
      id={id}
      ref={ref}
      width={FONT_SIZE * 4}
      height={FONT_SIZE + Math.ceil(FONT_SIZE / 2)}
      className="chord-symbol"
    />
  );
}
