import { Chord, Interval, Note, NoteLiteral } from "@tonaljs/tonal";
import _ from "lodash";
import { getVoicing } from "./TwoFiveOne";

export const chooseRandomChordSequence = () => {
  const notes = _.map(_.range(60, 72), (x) => Note.fromMidi(x));
  console.log({ notes });
  let note = _.shuffle(notes)[0];
  console.log({ note });

  const one = note.slice(0, -1); // remove the trailing digit for octave
  return majorTwoFiveOne(one);
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
