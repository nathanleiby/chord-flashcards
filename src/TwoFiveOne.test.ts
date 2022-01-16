import { Chord } from "@tonaljs/tonal";
import {
  getModifierForChord,
  getVoicing,
  voicingToKeyboard,
} from "./TwoFiveOne";

test("getModifierForChord", () => {
  expect(getModifierForChord(Chord.getChord("m7", "C"))).toBeDefined();
});

test("getVoicing", () => {
  expect(getVoicing("C", "major", 3)).toEqual(["E", "G", "B", "D"]);
  expect(getVoicing("D", "major", 3)).toEqual(["F#", "A", "C#", "E"]);
  expect(getVoicing("Eb", "major", 3)).toEqual(["G", "Bb", "D", "F"]);

  expect(getVoicing("C", "major", 7)).toEqual(["B", "D", "E", "G"]);
  expect(getVoicing("D", "major", 7)).toEqual(["C#", "E", "F#", "A"]);
  expect(getVoicing("Eb", "major", 7)).toEqual(["D", "F", "G", "Bb"]);

  expect(getVoicing("C", "minor", 7)).toEqual(["Bb", "D", "Eb", "G"]);
  expect(getVoicing("F#", "minor", 3)).toEqual(["A", "C#", "E", "G#"]);

  expect(getVoicing("Ab", "dominant", 7)).toEqual(["Gb", "Bb", "C", "F"]);
  expect(getVoicing("F", "dominant", 3)).toEqual(["A", "D", "Eb", "G"]);
});

test("voicingToKeyboard", () => {
  expect(voicingToKeyboard(["E", "G", "B", "D"])).toEqual([
    "E3",
    "G3",
    "B3",
    "D4",
  ]);
});
