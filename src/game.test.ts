import { majorTwoFiveOne } from "./game";

test("chooseRandomChordSequence", () => {
  expect(majorTwoFiveOne("C2").length).toEqual(3);
  expect(majorTwoFiveOne("C3").length).toEqual(3);
  expect(majorTwoFiveOne("D2").length).toEqual(3);
  expect(majorTwoFiveOne("E2").length).toEqual(3);
  expect(majorTwoFiveOne("f2").length).toEqual(3);
  expect(majorTwoFiveOne("f2").length).toEqual(3);
  expect(majorTwoFiveOne("Eb2").length).toEqual(3);
});
