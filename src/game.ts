import { Chord, Interval, Note, NoteLiteral } from "@tonaljs/tonal";
import _ from "lodash";
import { BottomNote, getVoicing } from "./TwoFiveOne";

export enum ChordSelector {
  Random = "random",
  HalfStep = "half-step",
  WholeStep = "whole-step",
}

export enum VoicingSelector {
  MajorTwoFiveOne = "major-2-5-1",
  MinorTwoFiveOne = "minor-2-5-1",
}

export enum RootNoteSelector {
  Random = "random",
  One = "one",
  Three = "three",
  Seven = "seven",
}

export const getNextRoot = (
  selector: ChordSelector = ChordSelector.Random,
  prevRoot: NoteLiteral
) => {
  return simplifyEnharmonicRoot(getNextRootHelper(selector, prevRoot));
};

const simplifyEnharmonicRoot = (note: NoteLiteral, isMajor = true) => {
  switch (note) {
    case "A#":
      return "Bb";
    case "G#":
      return "Ab";
    case "F#":
      return "Gb";
    case "D#":
      return "Eb";
    case "C#":
      return "Db";
    default:
      return note;
  }
};

const getNextRootHelper = (
  selector: ChordSelector = ChordSelector.Random,
  prevRoot: NoteLiteral
) => {
  switch (selector) {
    case ChordSelector.Random:
      let newNote = prevRoot;
      while (newNote === prevRoot) {
        const notes = _.map(_.range(60, 72), (x) => Note.fromMidi(x));
        const note = _.shuffle(notes)[0];
        newNote = note.slice(0, -1); // remove the trailing digit for octave
      }
      return newNote;
    case ChordSelector.HalfStep:
      return Note.enharmonic(Note.transpose(prevRoot, "m2"));
    case ChordSelector.WholeStep:
      return Note.enharmonic(Note.transpose(prevRoot, "M2"));
  }
};

export const majorTwoFiveOne = (one: NoteLiteral, bottom: BottomNote = 3) => {
  const two = Note.transpose(one, Interval.fromSemitones(2));
  const five = Note.transpose(one, Interval.fromSemitones(7));

  const chord1 = Chord.getChord("m7", two);
  // TODO: revisit this hack where we overrides notes in the chord..
  // another option: pass along chord symbol instead of parsing Chord Type in <Score>
  let rootNums: BottomNote[] = [3, 7, 3];
  if (bottom == 7) {
    rootNums = [7, 3, 7];
  }
  chord1.notes = getVoicing(two, "minor", rootNums[0]);

  const chord2 = Chord.getChord("7", five);
  chord2.notes = getVoicing(five, "dominant", rootNums[1]);

  const chord3 = Chord.getChord("M7", one.toString());
  chord3.notes = getVoicing(one.toString(), "major", rootNums[2]);

  const out = [chord1, chord2, chord3];
  return out;
};
