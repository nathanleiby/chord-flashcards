import { Midi } from "@tonaljs/tonal";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import Vex from "vexflow";

const letters = ["C", "D", "E", "F", "G", "A", "B"];
// translates from note names to vexflow chord notation, e.g.
// input: ["A", "C#", "E"])
// output: "(C#4 E4 A4)/w"
const toVexflowChord = (targetNotes: string[]): string => {
  return `(${targetNotes.join(" ")})/w`;
};

type ScoreV2Params = {
  activeMidiNotes: number[];
};

export const ScoreV2 = (params: ScoreV2Params) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [id] = useState(_.uniqueId("vexflow-"));
  const { activeMidiNotes } = params;

  useEffect(() => {
    if (ref.current == null) {
      return;
    }

    // clear previous contents
    ref.current.innerHTML = "";

    const vf = new Vex.Flow.Factory({
      renderer: { elementId: ref.current.id, width: 200, height: 150 },
    });

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

    const system = appendSystem(150);
    if (activeMidiNotes.length) {
      const sortedNotes = _.map(activeMidiNotes, (n) => Midi.midiToNoteName(n));
      console.log({ sortedNotes });
      const notesS = toVexflowChord(sortedNotes);
      console.log({ notesS });

      const scoreNotes = notes(notesS, {
        stem: "up",
      });
      const staveParams = { voices: [voice(scoreNotes, { time: `4/4` })] };
      system.addStave(staveParams).addClef("treble");
    } else {
      const scoreNotes = notes("B4/1/r", {
        stem: "up",
      });
      const staveParams = { voices: [voice(scoreNotes, { time: `4/4` })] };
      system.addStave(staveParams).addClef("treble");
    }

    vf.draw();
  }, [activeMidiNotes]);

  return <div id={id} ref={ref} className="score" />;
};
