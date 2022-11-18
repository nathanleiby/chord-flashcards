import { BbFormat } from "bb-format";
import _ from "lodash";
import { useEffect, useRef, useState } from "react";
import "./ChordSymbol.css";

export interface ChordSymbolProps {
  chordSymbol: string;
}

const FONT_SIZE = 20;
export default function ChordSymbol(props: ChordSymbolProps) {
  const { chordSymbol } = props;
  const [id] = useState(_.uniqueId("chord-symbol-"));
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = document.getElementById(id) as HTMLCanvasElement;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.font = `${FONT_SIZE}px Petaluma Script`;

    const formatter = new BbFormat(ctx);

    // // Modify the formatter's config
    // const options = new BbChordSymbolOptions();
    // options.parentheses.type = "[]";
    // options.useMinusSignForMinorChords = false;
    // options.descriptorVerticalOffset = 0;
    // options.separator.angle = (Math.PI * 20) / 360;

    // formatter.chordSymbolOptions = options;

    // // tweak the chord's pre-layout renderer's config
    // formatter.rendererOptions = {
    //   useShortNamings: false,
    //   harmonizeAccidentals: true,
    //   transposeValue: 2, // transpose a whole tone above
    // };

    formatter.fillChordSymbol(chordSymbol, 0, FONT_SIZE / 2);
  }, [chordSymbol]);

  return (
    <canvas
      id={id}
      ref={ref}
      width={100}
      height={FONT_SIZE * 2}
      className="chord-symbol"
    />
  );
}
