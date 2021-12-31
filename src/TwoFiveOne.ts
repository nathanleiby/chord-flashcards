import { Chord, Interval, Note } from "@tonaljs/tonal";

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
