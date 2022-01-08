import { compareNotes } from "./compare";

test("compareNotes", () => {
  expect(compareNotes([], [])).toEqual({
    missingNotes: [],
    extraNotes: [],
    correctNotes: [],
    isCorrect: true,
  });

  expect(compareNotes(["A"], [45])).toEqual({
    missingNotes: [],
    extraNotes: [],
    correctNotes: ["A"],
    isCorrect: true,
  });

  expect(compareNotes(["A", "B"], [45, 47])).toEqual({
    missingNotes: [],
    extraNotes: [],
    correctNotes: ["A", "B"],
    isCorrect: true,
  });

  expect(compareNotes(["A", "B"], [46, 47])).toEqual({
    missingNotes: ["A"],
    extraNotes: ["Bb"],
    correctNotes: ["B"],
    isCorrect: false,
  });

  // enharmonic notes
  expect(compareNotes(["E"], [52])).toEqual({
    missingNotes: [],
    extraNotes: [],
    correctNotes: ["E"],
    isCorrect: true,
  });

  // enharmonic notes
  expect(compareNotes(["Fb"], [52])).toEqual({
    missingNotes: [],
    extraNotes: [],
    correctNotes: ["Fb"],
    isCorrect: true,
  });
});
