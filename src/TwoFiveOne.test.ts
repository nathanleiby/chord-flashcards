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
  expect(voicingToKeyboard(["E", "G", "B", "D"])).toEqual([
    "E4",
    "G4",
    "B4",
    "D5",
  ]);

  expect(voicingToKeyboard(["F", "A", "Bb", "D"])).toEqual([
    "F4",
    "A4",
    "Bb4",
    "D5",
  ]);

  expect(voicingToKeyboard(["Db", "F", "G", "C"])).toEqual([
    "Db4",
    "F4",
    "G4",
    "C5",
  ]);
});

test("isOctaveCrossing", () => {
  expect(isOctaveCrossing("A", "B")).toBe(false);
  expect(isOctaveCrossing("A", "C")).toBe(true);
  expect(isOctaveCrossing("G", "C")).toBe(true);
  expect(isOctaveCrossing("G", "D")).toBe(true);
});
