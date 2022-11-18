import {
  getNextRoot,
  majorTwoFiveOne,
  PracticeMovement,
  PracticeMovementDirection,
} from "./game";

test("chooseRandomChordSequence", () => {
  expect(majorTwoFiveOne("C2").length).toEqual(3);
  expect(majorTwoFiveOne("C3").length).toEqual(3);
  expect(majorTwoFiveOne("D2").length).toEqual(3);
  expect(majorTwoFiveOne("E2").length).toEqual(3);
  expect(majorTwoFiveOne("f2").length).toEqual(3);
  expect(majorTwoFiveOne("f2").length).toEqual(3);
  expect(majorTwoFiveOne("Eb2").length).toEqual(3);
});

test("getNextRoot", () => {
  expect(
    getNextRoot(
      PracticeMovement.HalfStep,
      "C",
      PracticeMovementDirection.Down,
      false
    )
  ).toEqual("B");

  expect(
    getNextRoot(
      PracticeMovement.HalfStep,
      "G",
      PracticeMovementDirection.Down,
      false
    )
  ).toEqual("F#");
});
