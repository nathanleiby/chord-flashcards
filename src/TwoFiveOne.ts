import { Chord, Interval, Note } from "@tonaljs/tonal";
import Vex from "vexflow";

const intervals = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((x) =>
  Interval.fromSemitones(x)
);
const notes = intervals.map((x) => Note.transpose("C", x));

const majorTwoFiveOnes = notes.map((x) => [
  Chord.getChord("m7", Note.transpose(x, Interval.fromSemitones(2))),
  Chord.getChord("7", Note.transpose(x, Interval.fromSemitones(7))),
  Chord.getChord("M7", x),
]);

// See the "voicing dictionary" in the tonal.js for chord naming help
// https://github.com/tonaljs/tonal/tree/main/packages/voicing-dictionary
const minorTwoFiveOnes = notes.map((x) => [
  Chord.getChord("m7b5", Note.transpose(x, Interval.fromSemitones(2))),
  Chord.getChord("7b13", Note.transpose(x, Interval.fromSemitones(7))),
  Chord.getChord("mM7", x), // could also be m6
]);

const rootlessMajorTwoFiveOne = [
  ["F4", "A4", "C5", "E5"],
  ["F4", "A4", "B4", "E5"],
  ["E4", "G4", "B4", "D5"],
];

export const twoFiveOnes = majorTwoFiveOnes.concat(minorTwoFiveOnes);

const minorModifier = (tonic: string) =>
  new Vex.Flow.ChordSymbol()
    .setFont("robotoSlab", 15, "normal")
    .setStyle({ fillStyle: "black", strokeStyle: "black" })
    .addGlyphOrText(`${tonic}m`)
    .addGlyphOrText("7", {
      symbolModifier: Vex.Flow.ChordSymbol.symbolModifiers.SUPERSCRIPT,
    });

const dominantModifier = (tonic: string) =>
  new Vex.Flow.ChordSymbol()
    .setFont("robotoSlab", 15, "normal")
    .setStyle({ fillStyle: "black", strokeStyle: "black" })
    .addGlyphOrText(`${tonic}`)
    .addGlyphOrText("7", {
      symbolModifier: Vex.Flow.ChordSymbol.symbolModifiers.SUPERSCRIPT,
    });

const majorModifier = (tonic: string) =>
  new Vex.Flow.ChordSymbol()
    .setFont("robotoSlab", 15, "normal")
    .setStyle({ fillStyle: "black", strokeStyle: "black" })
    .addGlyphOrText(`${tonic}`)
    .addGlyph("majorSeventh", {
      symbolModifier: Vex.Flow.ChordSymbol.symbolModifiers.SUPERSCRIPT,
    })
    .addGlyphOrText("7", {
      symbolModifier: Vex.Flow.ChordSymbol.symbolModifiers.SUPERSCRIPT,
    });

const halfDiminishedModifier = (tonic: string) =>
  new Vex.Flow.ChordSymbol()
    .setFont("robotoSlab", 15, "normal")
    .setStyle({ fillStyle: "black", strokeStyle: "black" })
    .addGlyphOrText(`${tonic}`)
    .addGlyph("halfDiminished", {
      symbolModifier: Vex.Flow.ChordSymbol.symbolModifiers.SUPERSCRIPT,
    });

const minorFlatFiveModifier = (tonic: string) =>
  new Vex.Flow.ChordSymbol()
    .setFont("robotoSlab", 15, "normal")
    .setStyle({ fillStyle: "black", strokeStyle: "black" })
    .addGlyphOrText(`${tonic}m`)
    .addGlyphOrText("7b5", {
      symbolModifier: Vex.Flow.ChordSymbol.symbolModifiers.SUPERSCRIPT,
    });

const altModifier = (tonic: string) =>
  new Vex.Flow.ChordSymbol()
    .setFont("robotoSlab", 15, "normal")
    .setStyle({ fillStyle: "black", strokeStyle: "black" })
    .addGlyphOrText(`${tonic}`)
    .addGlyphOrText("alt7", {
      symbolModifier: Vex.Flow.ChordSymbol.symbolModifiers.SUPERSCRIPT,
    });

const minorMajorModifier = (tonic: string) =>
  new Vex.Flow.ChordSymbol()
    .setFont("robotoSlab", 15, "normal")
    .setStyle({ fillStyle: "black", strokeStyle: "black" })
    .addGlyphOrText(`${tonic}m`)
    .addGlyph("majorSeventh", {
      symbolModifier: Vex.Flow.ChordSymbol.symbolModifiers.SUPERSCRIPT,
    })
    .addGlyphOrText("7", {
      symbolModifier: Vex.Flow.ChordSymbol.symbolModifiers.SUPERSCRIPT,
    });

export type MyChord = ReturnType<typeof Chord.chord>;

export const getModifierForChord = (chord: MyChord) => {
  // TODO: investigate when/how this could occur.
  if (!chord.tonic) {
    console.error(`invalid chord. no tonic is defined ${chord}`);
    return;
  }

  switch (chord.type) {
    case "minor seventh":
      return minorModifier(chord.tonic);
    case "major seventh":
      return majorModifier(chord.tonic);
    case "dominant seventh":
      return dominantModifier(chord.tonic);
    case "half-diminished":
      return halfDiminishedModifier(chord.tonic);
    case "minor/major seventh":
      return minorMajorModifier(chord.tonic);
    case "":
      if (chord.symbol.indexOf("7b13") > -1) {
        return altModifier(chord.tonic);
      }
      console.error(`unable to render chord. ${chord}`);
      return;
    default:
      console.error(`unable to render chord. ${chord}`);
      return;
  }
};
