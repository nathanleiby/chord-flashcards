import { Chord, Interval, Note, NoteLiteral } from "@tonaljs/tonal";
import _ from "lodash";
import { getVoicing } from "./TwoFiveOne";

export enum ChordSelector {
  Random = "random",
  HalfStep = "half-step",
  WholeStep = "whole-step",
}

export const getNextRoot = (
  selector: ChordSelector = ChordSelector.Random,
  prevRoot: NoteLiteral
) => {
  return simplifyEnharmonicRoot(getNextRootHelper(selector, prevRoot));
};

const simplifyEnharmonicRoot = (note: NoteLiteral, isMajor = true) => {
  switch (note) {
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
      const notes = _.map(_.range(60, 72), (x) => Note.fromMidi(x));
      let note = _.shuffle(notes)[0];
      return note.slice(0, -1); // remove the trailing digit for octave
    case ChordSelector.HalfStep:
      return Note.enharmonic(Note.transpose(prevRoot, "m2"));
    case ChordSelector.WholeStep:
      return Note.enharmonic(Note.transpose(prevRoot, "M2"));
  }
};

export const majorTwoFiveOne = (one: NoteLiteral) => {
  const two = Note.transpose(one, Interval.fromSemitones(2));
  const five = Note.transpose(one, Interval.fromSemitones(7));

  const chord1 = Chord.getChord("m7", two);
  // TODO: revisit this hack where we overrides notes in the chord..
  // another option: pass along chord symbol instead of parsing Chord Type in <Score>
  chord1.notes = getVoicing(two, "minor", 7);

  const chord2 = Chord.getChord("7", five);
  chord2.notes = getVoicing(five, "dominant", 3);

  const chord3 = Chord.getChord("M7", one.toString());
  chord3.notes = getVoicing(one.toString(), "major", 7);

  const out = [chord1, chord2, chord3];
  return out;
};
