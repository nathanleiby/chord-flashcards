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

/**
 * Compare notes by pitch class only (ignoring octave)
 */
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

/**
 * Compare notes exactly, including octave (e.g., "F4" must match exactly)
 * @param targetNotesWithOctave - Notes with octaves like ["F4", "A4", "C5", "E5"]
 * @param activeNotes - MIDI note numbers
 */
export const compareExactNotes = (
  targetNotesWithOctave: string[],
  activeNotes: number[]
): CompareNotesOutput => {
  const correctNotes: string[] = [];
  const extra: number[] = [];

  // Convert target notes with octaves to MIDI numbers for exact comparison
  const targetMidiNumbers = targetNotesWithOctave.map((noteWithOctave) => {
    const midi = Note.midi(noteWithOctave);
    if (midi === null) {
      console.warn(`Could not convert ${noteWithOctave} to MIDI`);
      return null;
    }
    return midi;
  }).filter((midi): midi is number => midi !== null);

  // Check each active note against target notes
  for (const activeMidi of activeNotes) {
    if (targetMidiNumbers.includes(activeMidi)) {
      // Find the corresponding note name with octave
      const noteWithOctave = targetNotesWithOctave.find(
        (n) => Note.midi(n) === activeMidi
      );
      if (noteWithOctave) {
        correctNotes.push(noteWithOctave);
      }
    } else {
      extra.push(activeMidi);
    }
  }

  // Find missing notes (target notes that weren't played)
  const playedMidiSet = new Set(activeNotes);
  const missingNotes = targetNotesWithOctave.filter(
    (noteWithOctave) => {
      const midi = Note.midi(noteWithOctave);
      return midi !== null && !playedMidiSet.has(midi);
    }
  );

  const extraNotes = _.map(extra, (n) => Note.pitchClass(Note.fromMidi(n)));
  const isCorrect = missingNotes.length === 0 && extraNotes.length === 0;

  return {
    missingNotes,
    extraNotes,
    correctNotes,
    isCorrect,
  };
};
