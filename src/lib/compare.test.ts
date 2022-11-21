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

  expect(compareNotes(["A##", "B#"], [47, 48])).toEqual({
    missingNotes: [],
    extraNotes: [],
    correctNotes: ["A##", "B#"],
    isCorrect: true,
  });

  expect(compareNotes(["Cb", "Dbb"], [47, 48])).toEqual({
    missingNotes: [],
    extraNotes: [],
    correctNotes: ["Cb", "Dbb"],
    isCorrect: true,
  });
});

// test("compareVoicing", () => {
//   expect(compareNotes([], [])).toEqual({
//     missingNotes: [],
//     extraNotes: [],
//     correctNotes: [],
//     isCorrect: true,
//   });
// });
