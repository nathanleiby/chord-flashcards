import { chordParserFactory, chordRendererFactory } from "chord-symbol";
import _ from "lodash";
import { useEffect, useRef, useState } from "react";
import "./ChordSymbol.css";

export interface ChordSymbolProps {
  chordSymbol: string;
}

const FONT_SIZE = 32;
const parseChord = chordParserFactory();

// Configure renderer with custom filters for alternative formats:
// - Use "-" instead of "m", "mi", "min", "minor" for all minor chords (e.g., F-7, C-9, D-11)
// - Use "Δ" (triangle) instead of "M", "Ma", "Maj", "maj", "major" for all major chords (e.g., EbΔ7, CΔ9)
// This applies to all chord extensions (7, 9, 11, 13, etc.) and variations
const renderChord = chordRendererFactory({
  useShortNamings: true,
  customFilters: [
    (chord) => {
      if (!chord.formatted) return chord;

      const quality = chord.normalized?.quality || "";
      let symbol = chord.formatted.symbol;

      // Determine if chord is minor or major based on quality
      const isMinor = quality.includes("minor") && !quality.includes("major");
      const isMajor = quality.includes("major") && !quality.includes("minor");

      // Handle all minor chord variations: m, mi, min, minor -> "-"
      if (isMinor) {
        // Replace "mi" or "min" followed by optional digits/extensions
        symbol = symbol.replace(/mi(\d*)/gi, "-$1");
        symbol = symbol.replace(/min(\d*)/gi, "-$1");
        // Replace standalone "m" followed by digits/extensions (e.g., "m7", "m9", "m11")
        // Pattern: root note + "m" + (optional b/#) + digits/extensions
        symbol = symbol.replace(/([A-G][b#]?)m(\d+)/g, "$1-$2");
        // Handle "minor" word
        symbol = symbol.replace(/minor(\d*)/gi, "-$1");
      }

      // Handle all major chord variations: M, Ma, Maj, maj, major -> "Δ"
      if (isMajor) {
        // Replace "Ma" or "Maj" or "maj" followed by digits
        symbol = symbol.replace(/Ma(\d+)/g, "Δ$1");
        symbol = symbol.replace(/Maj(\d+)/gi, "Δ$1");
        symbol = symbol.replace(/maj(\d+)/gi, "Δ$1");
        // Replace "M" followed by digits (e.g., "M7", "M9", "M11")
        // Pattern: root note + "M" + digits
        symbol = symbol.replace(/([A-G][b#]?)M(\d+)/g, "$1Δ$2");
        // Handle "major" word
        symbol = symbol.replace(/major(\d*)/gi, "Δ$1");
      }

      // Also handle cases where symbol contains these patterns even if quality check didn't catch it
      // This handles edge cases and ensures consistency
      if (!isMinor && !isMajor) {
        // If we see "mi" or "min" in the symbol, treat as minor
        if (/mi|min/i.test(symbol)) {
          symbol = symbol.replace(/mi(\d*)/gi, "-$1");
          symbol = symbol.replace(/min(\d*)/gi, "-$1");
          symbol = symbol.replace(/([A-G][b#]?)m(\d+)/g, "$1-$2");
        }
        // If we see "Ma", "Maj", "maj" or "M" followed by digit, treat as major
        if (/Ma\d|Maj\d|maj\d|M\d/.test(symbol)) {
          symbol = symbol.replace(/Ma(\d+)/g, "Δ$1");
          symbol = symbol.replace(/Maj(\d+)/gi, "Δ$1");
          symbol = symbol.replace(/maj(\d+)/gi, "Δ$1");
          symbol = symbol.replace(/([A-G][b#]?)M(\d+)/g, "$1Δ$2");
        }
      }

      chord.formatted.symbol = symbol;
      return chord;
    },
  ],
});

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
