import {
  Chord,
  Interval,
  IntervalLiteral,
  Note,
  NoteLiteral,
} from "@tonaljs/tonal";
import _ from "lodash";
import {
  BottomNote,
  getMajor251Voicing,
  getMinor251Voicing,
} from "./TwoFiveOne";

export enum PracticeMovement {
  Random = "random",
  HalfStep = "half-step",
  WholeStep = "whole-step",
  CircleOfFifths = "circle-of-fifths",
}

export enum PracticeMovementDirection {
  Down = "Down",
  Up = "Up",
}
export enum ChordProgression {
  MajorTwoFiveOne = "major-2-5-1",
  MinorTwoFiveOne = "minor-2-5-1",
}

export enum LowNote {
  Random = "random",
  One = "one",
  Three = "three",
  Seven = "seven",
}

export const getNextRoot = (
  selector: PracticeMovement = PracticeMovement.Random,
  prevRoot: NoteLiteral,
  direction: PracticeMovementDirection = PracticeMovementDirection.Down
) => {
  return simplifyEnharmonicRoot(
    getNextRootHelper(selector, prevRoot, direction)
  );
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
  selector: PracticeMovement = PracticeMovement.Random,
  prevRoot: NoteLiteral,
  direction: PracticeMovementDirection = PracticeMovementDirection.Down
) => {
  let move: IntervalLiteral;
  switch (selector) {
    case PracticeMovement.Random:
      let newNote = prevRoot;
      while (newNote === prevRoot) {
        const notes = _.map(_.range(60, 72), (x) => Note.fromMidi(x));
        const note = _.shuffle(notes)[0];
        newNote = note.slice(0, -1); // remove the trailing digit for octave
      }
      return newNote;
    case PracticeMovement.HalfStep:
      move = direction === PracticeMovementDirection.Up ? "m2" : "M7";
      return Note.enharmonic(Note.transpose(prevRoot, move));
    case PracticeMovement.WholeStep:
      move = direction === PracticeMovementDirection.Up ? "M2" : "m7";
      return Note.enharmonic(Note.transpose(prevRoot, move));
    case PracticeMovement.CircleOfFifths:
      move = direction === PracticeMovementDirection.Up ? "P5" : "P4";
      return Note.enharmonic(Note.transpose(prevRoot, move));
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
  chord1.notes = getMajor251Voicing(two, "minor", rootNums[0]);

  const chord2 = Chord.getChord("7", five);
  chord2.notes = getMajor251Voicing(five, "dominant", rootNums[1]);

  const chord3 = Chord.getChord("M7", one.toString());
  chord3.notes = getMajor251Voicing(one.toString(), "major", rootNums[2]);

  const out = [chord1, chord2, chord3];
  return out;
};

// TODO: explore other alt voicings for dom chord, also root chords (m6)
// https://www.thejazzpianosite.com/jazz-piano-lessons/jazz-chord-progressions/minor-ii-v-i/
export const minorTwoFiveOne = (one: NoteLiteral, bottom: BottomNote = 3) => {
  const two = Note.transpose(one, Interval.fromSemitones(2));
  const five = Note.transpose(one, Interval.fromSemitones(7));

  const chord1 = Chord.getChord("m7b5", two);
  // TODO: revisit this hack where we overrides notes in the chord..
  // another option: pass along chord symbol instead of parsing Chord Type in <Score>
  let rootNums: BottomNote[] = [3, 7, 3];
  if (bottom == 7) {
    rootNums = [7, 3, 7];
  }
  chord1.notes = getMinor251Voicing(two, "two", rootNums[0]);

  const chord2 = Chord.getChord("7b13", five);
  chord2.notes = getMinor251Voicing(five, "five", rootNums[1]);

  const chord3 = Chord.getChord("mM7", one.toString());
  chord3.notes = getMinor251Voicing(one.toString(), "one", rootNums[2]);

  const out = [chord1, chord2, chord3];
  return out;
};
