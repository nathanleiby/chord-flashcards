import { Chord } from "@tonaljs/tonal";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import Vex from "vexflow";
import {
  altModifier,
  dominantModifier,
  halfDiminishedModifier,
  majorModifier,
  minorMajorModifier,
  minorModifier,
} from "./TwoFiveOne";

const letters = ["C", "D", "E", "F", "G", "A", "B"];

// translates from note names to vexflow chord notation, e.g.
// input: ["A", "C#", "E"])
// output: "(C#4 E4 A4)/w"
const toVexflowChord = (targetNotes: string[]): string => {
  // For now, assume all notes are in 4th octave.
  // Future: translate specific midi notes to get correct voicing.
  const sortedNotes = _.clone(targetNotes);
  sortedNotes.sort((a, b) => letters.indexOf(a[0]) - letters.indexOf(b[0]));

  return `(${sortedNotes.map((n) => `${n}4`).join(" ")})/w`;
};

type ScoreParams = {
  chord: ReturnType<typeof Chord.chord>;
};

export const Score = (params: ScoreParams) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [id] = useState(_.uniqueId("vexflow-"));
  const { chord } = params;

  const notes = toVexflowChord(chord.notes);

  useEffect(() => {
    if (ref.current == null) {
      return;
    }

    // clear previous contents
    ref.current.innerHTML = "";

    const vf = new Vex.Flow.Factory({
      renderer: { elementId: ref.current.id, width: 500, height: 200 },
    });

    const score = vf.EasyScore();
    const system = vf.System();

    // TODO: investigate when/how this could occur.
    if (!chord.tonic) {
      console.error(`invalid chord. no tonic is defined ${chord}`);
      return;
    }

    let modifier;
    switch (chord.type) {
      case "minor seventh":
        modifier = minorModifier(chord.tonic);
        break;
      case "major seventh":
        modifier = majorModifier(chord.tonic);
        break;
      case "dominant seventh":
        modifier = dominantModifier(chord.tonic);
        break;
      case "half-diminished":
        modifier = halfDiminishedModifier(chord.tonic);
        break;
      case "minor/major seventh":
        modifier = minorMajorModifier(chord.tonic);
        break;
      case "":
        if (chord.symbol.indexOf("7b13") > -1) {
          modifier = altModifier(chord.tonic);
          break;
        }
        return;
      default:
        console.error(`unable to render chord: ${chord}`);
        return;
    }

    const scoreNotes = score.notes(notes, { stem: "up" });
    scoreNotes[0].addModifier(modifier, 0);
    system
      .addStave({
        voices: [score.voice(scoreNotes)],
      })
      .addClef("treble")
      .addTimeSignature("4/4");

    vf.draw();
  }, [notes]);

  return <div id={id} ref={ref} />;
};
