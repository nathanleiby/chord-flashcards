import { Chord, Interval, Note, NoteName } from "@tonaljs/tonal";
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

const rootlessVoicings = {
  minor: {
    root: "D",
    voicing: ["F", "A", "C", "E"],
    bottom_note: 3,
  },

  dominant: {
    root: "G",
    voicing: ["F", "A", "B", "E"],
    bottom_note: 7,
  },
  major: {
    root: "C",
    voicing: ["E", "G", "B", "D"],
    bottom_note: 3,
  },
};

export const getVoicing = (
  root: string, // TODO: valid notes
  quality: "minor" | "dominant" | "major",
  bottom_note: 3 | 7
) => {
  const rv = rootlessVoicings[quality];

  // figure out distance to desired key, then translate
  const interval = Interval.distance(rv.root, root);
  const voicing = rv.voicing.map((n) => Note.transpose(n, interval));

  if (bottom_note !== rv.bottom_note) {
    return [voicing[2], voicing[3], voicing[0], voicing[1]];
  }

  return voicing;
};

const isOctaveCrossing = (prev: NoteName, curr: NoteName) => {
  if (prev.length != 1) {
    throw `must be a single letter note name (without accidental), but was: ${prev}`;
  }
  if (curr.length != 1) {
    throw `must be a single letter note name (without accidental), but was: ${curr}`;
  }
  if ((prev == "A" || prev == "B") && !(curr == "A" || curr == "B")) {
    return true;
  }
  return false;
};

export const voicingToKeyboard = (voicing: string[]) => {
  const out: string[] = [];
  let aboveC = false;
  for (let i = 0; i < voicing.length; i++) {
    const note = voicing[i];
    const letter = note.substring(0, 1);
    const accidental = note.substring(1);

    if (
      (i == 0 && note == "C") ||
      (i > 0 && isOctaveCrossing(voicing[i - 1][0], letter))
    ) {
      aboveC = true;
    }

    const octave = aboveC ? 4 : 3;
    const vexflowNote = `${letter}${accidental}${octave}`;
    out.push(vexflowNote);
  }
  return out.map((n) => `${n}`);
};

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
