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

type ScoreParams = {
  chord: ReturnType<typeof Chord.chord>;

  // a VexFlow chord, like: "C#5/q, B4, A4, G#4"
  // TODO: We coudl convert these inside this method, now that we're passing the chord too.
  // maybe 'voicing' is the best name for this given the current use case of specific notes.
  notes: string;
};

export const Score = (params: ScoreParams) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [id] = useState(_.uniqueId("vexflow-"));
  const { notes, chord } = params;

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

// export function Score(
//   {
//     // staves = [],
//     // clef = "treble",
//     // timeSignature = "4/4",
//     // keySignature: string = null,
//     // width = 450,
//     // height = 150,
//   }
// ) {
//   const container = useRef();
//   const rendererRef = useRef();

//   // useEffect(() => {
//   // if (rendererRef.current == null) {
//   //   rendererRef.current = new Renderer(
//   //     container.current,
//   //     Renderer.Backends.SVG
//   //   );
//   // }
//   // const renderer = rendererRef.current;
//   // renderer.resize(width, height);
//   // const context = renderer.getContext();
//   // context.setFont("Arial", 10, "").setBackgroundFillStyle("#eed");
//   // const staveWidth = (width - clefAndTimeWidth) / staves.length;

//   // let currX = 0;
//   // staves.forEach((notes, i) => {
//   //   const stave = new Stave(currX, 0, staveWidth);
//   //   if (i === 0) {
//   //     stave.setWidth(staveWidth + clefAndTimeWidth);
//   //     stave.addClef(clef).addTimeSignature(timeSignature);
//   //     if (keySignature) {
//   //       stave.addKeySignature(keySignature);
//   //     }
//   //   }
//   //   currX += stave.getWidth();
//   //   stave.setContext(context).draw();

//   //   Formatter.FormatAndDraw(context, stave, processedNotes, {
//   //     auto_beam: true,
//   //   });
//   // });
//   // }, [staves]);

//   return <div ref={container} />;
// }
