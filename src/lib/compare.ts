import { Note, NoteLiteral } from "@tonaljs/tonal";
import _ from "lodash";

export type CompareVoicing = {
  missingNotes: NoteLiteral[];
  extraNotes: NoteLiteral[];
  correctNotes: NoteLiteral[];
  isCorrect: boolean;
};

// const convertActiveNotes = (notes: number[]) => {
//   return notes.map((n) => Note.fromMidi(n));
// };

// export const compareVoicing = (
//   targetNotes: number[],
//   activeNotes: number[]
// ): bool=> {};

export type CompareNotesOutput = {
  missingNotes: string[];
  extraNotes: string[];
  correctNotes: string[];
  isCorrect: boolean;
};

export const compareNotes = (
  targetNotes: string[],
  activeNotes: number[]
): CompareNotesOutput => {
  const correctNotes = [];
  const extra = [];
  for (const a of activeNotes) {
    let found = false;
    for (const t of targetNotes) {
      const aN = Note.pitchClass(Note.fromMidi(a));
      if (t === aN || Note.enharmonic(aN) === t || Note.enharmonic(t) === aN) {
        correctNotes.push(t);
        found = true;
        break;
      }
    }

    // keep track of extra notes
    if (!found) {
      extra.push(a);
    }
  }

  const missingNotes = _.difference(targetNotes, correctNotes);
  const extraNotes = _.map(extra, (n) => Note.pitchClass(Note.fromMidi(n)));
  const isCorrect = missingNotes.length === 0 && extraNotes.length === 0;

  return {
    missingNotes,
    extraNotes,
    correctNotes,
    isCorrect,
  };
};
