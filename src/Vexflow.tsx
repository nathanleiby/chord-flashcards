import _ from "lodash";
import React, { useEffect, useState } from "react";
import Vex from "vexflow";
import { getModifierForChord, MyChord, voicingToKeyboard } from "./TwoFiveOne";

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
  _.each(sortedNotes, (value, idx) => {
    if (params.correctNotes.includes(value)) {
      correctIndices.push(idx);
    }
  });

  const notes = toVexflowChord(sortedNotes);

  const modifier = getModifierForChord(chord);

  useEffect(() => {
    if (ref.current == null) {
      return;
    }

    // clear previous contents
    ref.current.innerHTML = "";

    const vf = new Vex.Flow.Factory({
      renderer: { elementId: ref.current.id, width: 300, height: 200 },
    });

    const score = vf.EasyScore();
    const system = vf.System();

    const scoreNotes = score.notes(notes, { stem: "up" });
    if (modifier) {
      scoreNotes[0].addModifier(modifier, 0);

      // highlight correct notes in green
      for (const idx of correctIndices) {
        scoreNotes[0].setKeyStyle(idx, { fillStyle: "green" });
      }
    }
    system
      .addStave({
        voices: [score.voice(scoreNotes)],
      })
      .addClef("treble");

    vf.draw();
  }, [chord, params.correctNotes]);

  return <div id={id} ref={ref} />;
};
