import { chordParserFactory, chordRendererFactory } from "chord-symbol";
import _ from "lodash";
import { useEffect, useRef, useState } from "react";
import "./ChordSymbol.css";

export interface ChordSymbolProps {
  chordSymbol: string;
}

const FONT_SIZE = 32;
const parseChord = chordParserFactory();
const renderChord = chordRendererFactory();

export default function ChordSymbol(props: ChordSymbolProps) {
  const { chordSymbol } = props;
  const [id] = useState(_.uniqueId("chord-symbol-"));
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = document.getElementById(id) as HTMLCanvasElement;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.font = `${FONT_SIZE}px Noto`;
    ctx.fillStyle = "black";
    ctx.textBaseline = "middle";

    try {
      const parsedChord = parseChord(chordSymbol);
      // Check if parsing was successful (has 'input' property) vs failure (has 'error' property)
      if ("input" in parsedChord) {
        const renderedChord = renderChord(parsedChord);
        ctx.fillText(renderedChord, 0, Math.ceil(FONT_SIZE / 2));
      } else {
        // Parsing failed, fallback to original chord symbol
        ctx.fillText(chordSymbol, 0, Math.ceil(FONT_SIZE / 2));
      }
    } catch (error) {
      // Fallback to original chord symbol if rendering fails
      ctx.fillText(chordSymbol, 0, Math.ceil(FONT_SIZE / 2));
    }
  }, [chordSymbol, id]);

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
