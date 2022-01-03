import { Chord, Interval, Note } from "@tonaljs/tonal";
import Vex from "vexflow";

const intervals = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((x) =>
  Interval.fromSemitones(x)
);
const notes = intervals.map((x) => Note.transpose("C", x));

export const majorTwoFiveOnes = notes.map((x) => [
  Chord.getChord("m7", Note.transpose(x, Interval.fromSemitones(2))),
  Chord.getChord("7", Note.transpose(x, Interval.fromSemitones(7))),
  Chord.getChord("M7", x),
]);

// See the "voicing dictionary" in the tonal.js for chord naming help
// https://github.com/tonaljs/tonal/tree/main/packages/voicing-dictionary
export const minorTwoFiveOnes = notes.map((x) => [
  Chord.getChord("m7b5", Note.transpose(x, Interval.fromSemitones(2))),
  Chord.getChord("7b13", Note.transpose(x, Interval.fromSemitones(7))),
  Chord.getChord("mM7", x), // could also be m6
]);

export const twoFiveOnes = majorTwoFiveOnes.concat(minorTwoFiveOnes);

// TODO: Move generation of chord names and modifiers into own file
export type KeyName = "A" | "B" | "C" | "D" | "E" | "F" | "G";
export type Accidental = "#" | "b";

export const minorModifier = (tonic: string) =>
  new Vex.Flow.ChordSymbol()
    .setFont("robotoSlab", 15, "normal")
    .addGlyphOrText(`${tonic}m`)
    .addGlyphOrText("7", {
      symbolModifier: Vex.Flow.ChordSymbol.symbolModifiers.SUPERSCRIPT,
    });

export const dominantModifier = (tonic: string) =>
  new Vex.Flow.ChordSymbol()
    .setFont("robotoSlab", 15, "normal")
    .addGlyphOrText(`${tonic}`)
    .addGlyphOrText("7", {
      symbolModifier: Vex.Flow.ChordSymbol.symbolModifiers.SUPERSCRIPT,
    });

export const majorModifier = (tonic: string) =>
  new Vex.Flow.ChordSymbol()
    .setFont("robotoSlab", 15, "normal")
    .addGlyphOrText(`${tonic}`)
    .addGlyph("majorSeventh", {
      symbolModifier: Vex.Flow.ChordSymbol.symbolModifiers.SUPERSCRIPT,
    })
    .addGlyphOrText("7", {
      symbolModifier: Vex.Flow.ChordSymbol.symbolModifiers.SUPERSCRIPT,
    });

export const halfDiminishedModifier = (tonic: string) =>
  new Vex.Flow.ChordSymbol()
    .setFont("robotoSlab", 15, "normal")
    .addGlyphOrText(`${tonic}`)
    .addGlyph("halfDiminished", {
      symbolModifier: Vex.Flow.ChordSymbol.symbolModifiers.SUPERSCRIPT,
    });

export const minorFlatFiveModifier = (tonic: string) =>
  new Vex.Flow.ChordSymbol()
    .setFont("robotoSlab", 15, "normal")
    .addGlyphOrText(`${tonic}m`)
    .addGlyphOrText("7b5", {
      symbolModifier: Vex.Flow.ChordSymbol.symbolModifiers.SUPERSCRIPT,
    });

export const altModifier = (tonic: string) =>
  new Vex.Flow.ChordSymbol()
    .setFont("robotoSlab", 15, "normal")
    .addGlyphOrText(`${tonic}`)
    .addGlyphOrText("alt7", {
      symbolModifier: Vex.Flow.ChordSymbol.symbolModifiers.SUPERSCRIPT,
    });

export const minorMajorModifier = (tonic: string) =>
  new Vex.Flow.ChordSymbol()
    .setFont("robotoSlab", 15, "normal")
    .addGlyphOrText(`${tonic}m`)
    .addGlyph("majorSeventh", {
      symbolModifier: Vex.Flow.ChordSymbol.symbolModifiers.SUPERSCRIPT,
    })
    .addGlyphOrText("7", {
      symbolModifier: Vex.Flow.ChordSymbol.symbolModifiers.SUPERSCRIPT,
    });
