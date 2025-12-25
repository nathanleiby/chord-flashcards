import { Chord } from "@tonaljs/tonal";
import {
  getMajor251Voicing,
  getMinor251Voicing,
  getModifierForChord,
  isOctaveCrossing,
  voicingToKeyboard,
} from "./TwoFiveOne";

test("getModifierForChord", () => {
  expect(getModifierForChord(Chord.getChord("m7", "C"))).toBeDefined();
});

test("getMajor251Voicing", () => {
  expect(getMajor251Voicing("C", "major", 3)).toEqual(["E", "G", "B", "D"]);
  expect(getMajor251Voicing("D", "major", 3)).toEqual(["F#", "A", "C#", "E"]);
  expect(getMajor251Voicing("Eb", "major", 3)).toEqual(["G", "Bb", "D", "F"]);

  expect(getMajor251Voicing("C", "major", 7)).toEqual(["B", "D", "E", "G"]);
  expect(getMajor251Voicing("D", "major", 7)).toEqual(["C#", "E", "F#", "A"]);
  expect(getMajor251Voicing("Eb", "major", 7)).toEqual(["D", "F", "G", "Bb"]);

  expect(getMajor251Voicing("C", "minor", 7)).toEqual(["Bb", "D", "Eb", "G"]);
  expect(getMajor251Voicing("F#", "minor", 3)).toEqual(["A", "C#", "E", "G#"]);

  expect(getMajor251Voicing("Ab", "dominant", 7)).toEqual([
    "Gb",
    "Bb",
    "C",
    "F",
  ]);
  expect(getMajor251Voicing("F", "dominant", 3)).toEqual(["A", "D", "Eb", "G"]);

  expect(getMajor251Voicing("G", "minor", 7)).toEqual(["F", "A", "Bb", "D"]);
  expect(getMajor251Voicing("E", "dominant", 7)).toEqual([
    "D",
    "F#",
    "G#",
    "C#",
  ]);
  expect(getMajor251Voicing("Eb", "dominant", 7)).toEqual([
    "Db",
    "F",
    "G",
    "C",
  ]);
});

test("getMinor251Voicing", () => {
  expect(getMinor251Voicing("D", "two", 3)).toEqual(["F", "Ab", "C", "Eb"]);
  expect(getMinor251Voicing("G", "five", 7)).toEqual(["F", "Ab", "B", "Eb"]);
  expect(getMinor251Voicing("C", "one", 3)).toEqual(["Eb", "G", "B", "D"]);
});

test("voicingToKeyboard", () => {
  // Test basic voicing
  expect(voicingToKeyboard(["E", "G", "B", "D"])).toEqual([
    "E3",
    "G3",
    "B3",
    "D4",
  ]);

  expect(voicingToKeyboard(["F", "A", "Bb", "D"])).toEqual([
    "F3",
    "A3",
    "Bb3",
    "D4",
  ]);

  expect(voicingToKeyboard(["Db", "F", "G", "C"])).toEqual([
    "Db3",
    "F3",
    "G3",
    "C4",
  ]);

  // Test AbMajor7 voicing (bottom note = 3): [C, Eb, G, Bb]
  // This was causing wrap-around issues where Bb could land an octave too high
  const abMajor7Voicing = getMajor251Voicing("Ab", "major", 3);
  expect(abMajor7Voicing).toEqual(["C", "Eb", "G", "Bb"]);
  const abMajor7Keyboard = voicingToKeyboard(abMajor7Voicing);
  expect(abMajor7Keyboard).toEqual(["C3", "Eb3", "G3", "Bb3"]);

  // Verify all notes are within C3-C5 range (MIDI 48-72)
  const noteToMidi = (note: string): number => {
    const noteMap: { [key: string]: number } = {
      'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11
    };
    const match = note.match(/^([A-G])(b|#)?(\d+)$/);
    if (!match) throw new Error(`Invalid note: ${note}`);

    const [, letter, accidental, octaveStr] = match;
    const octave = parseInt(octaveStr);
    let midi = noteMap[letter] + (octave + 1) * 12;

    if (accidental === 'b') midi -= 1;
    if (accidental === '#') midi += 1;

    return midi;
  };

  abMajor7Keyboard.forEach(note => {
    const midi = noteToMidi(note);
    expect(midi).toBeGreaterThanOrEqual(48); // C3
    expect(midi).toBeLessThanOrEqual(72);    // C5
  });
});

test("isOctaveCrossing", () => {
  expect(isOctaveCrossing("A", "B")).toBe(false);
  expect(isOctaveCrossing("A", "C")).toBe(true);
  expect(isOctaveCrossing("G", "C")).toBe(true);
  expect(isOctaveCrossing("G", "D")).toBe(true);
});
