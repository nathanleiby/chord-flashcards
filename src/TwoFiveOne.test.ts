import { Chord } from "@tonaljs/tonal";
import { getModifierForChord } from "./TwoFiveOne";

test("getModifierForChord", () => {
  expect(getModifierForChord(Chord.getChord("m7", "C"))).toBeDefined();
});
