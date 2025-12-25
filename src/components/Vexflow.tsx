import _ from "lodash";
import React, { useEffect, useState } from "react";
import Vex from "vexflow";
import {
  getModifierForChord,
  MyChord,
  voicingToKeyboard,
} from "../lib/TwoFiveOne";

const letters = ["C", "D", "E", "F", "G", "A", "B"];
// translates from note names to vexflow chord notation, e.g.
// input: ["A", "C#", "E"])
// output: "(C#4 E4 A4)/w"
const toVexflowChord = (targetNotes: string[]): string => {
  return `(${targetNotes.join(" ")})/w`;
};

type ScoreParams = {
  chord: MyChord;
  correctNotes: string[];
};

export const Score = (params: ScoreParams) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [id] = useState(_.uniqueId("vexflow-"));
  const { chord } = params;

  let sortedNotes = _.clone(chord.notes);
  sortedNotes = voicingToKeyboard(sortedNotes);

  const correctIndices: number[] = [];
  const { correctNotes } = params;

  // Detect if correctNotes contains octaves (exact matching mode)
  // Notes with octaves end with a digit (e.g., "F4", "Ab4", "C#5")
  const hasOctave = correctNotes.length > 0 &&
    correctNotes.some((n) => /^\d+$/.test(n.slice(-1)));

  _.each(sortedNotes, (value, idx) => {
    if (hasOctave) {
      // Exact matching: compare with octave (e.g., "F4" === "F4")
      if (correctNotes.includes(value)) {
        correctIndices.push(idx);
      }
    } else {
      // Pitch class matching: compare without octave (e.g., "F" === "F")
      const octavelessValue = value.slice(0, -1);
      if (correctNotes.includes(octavelessValue)) {
        correctIndices.push(idx);
      }
    }
  });

  // TOOD: vs score.notes()
  const notesS = toVexflowChord(sortedNotes);

  const modifier = getModifierForChord(chord);

  useEffect(() => {
    if (ref.current == null) {
      return;
    }

    // clear previous contents
    ref.current.innerHTML = "";

    const vf = new Vex.Flow.Factory({
      renderer: { elementId: ref.current.id, width: 200, height: 150 },
    });

    // let x = 120;
    // let y = 80;
    let x = 0;
    let y = 0;
    const appendSystem = (width: number) => {
      const system = vf.System({ x, y, width, spaceBetweenStaves: 10 });
      x += width;
      return system;
    };

    const score = vf.EasyScore({ throwOnError: true });

    // Bind these three functions so the code looks cleaner.
    // Instead of score.voice(...), just call voice(...).
    const voice = score.voice.bind(score);
    const notes = score.notes.bind(score);
    const beam = score.beam.bind(score);

    let system = appendSystem(150);
    // let system = vf.System();

    const scoreNotes = score.notes(notesS, {
      stem: "up",
    });

    if (modifier) {
      scoreNotes[0].addModifier(modifier, 0);

      // highlight correct notes in green
      // Cast to StaveNote since setKeyStyle is only available on StaveNote
      // score.notes() returns StemmableNote[] but for chords it's actually StaveNote
      const staveNote = scoreNotes[0] as any;
      for (const idx of correctIndices) {
        staveNote.setKeyStyle(idx, { fillStyle: "green" });
      }
    }
    system
      .addStave({
        voices: [voice(scoreNotes, { time: `4/4` })],
      })
      .addClef("treble");

    vf.draw();
  }, [chord, correctNotes]);

  return <div id={id} ref={ref} className="score" />;
};
