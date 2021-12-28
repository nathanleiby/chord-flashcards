import { Chord, Interval, Note } from "@tonaljs/tonal";

const qualities = ["major", "minor", "diminished"];

const intervals = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((x) =>
  Interval.fromSemitones(x)
);
const notes = intervals.map((x) => Note.transpose("C", x));
const chords = notes.map((x) => Chord.getChord("M7", x));

export const majorSeventhChords = chords;
