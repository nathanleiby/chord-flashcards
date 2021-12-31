import _ from "lodash";
import React, { useEffect, useState } from "react";
import Vex from "vexflow";

// export class Score extends React.Component {
//   ref = React.createRef<HTMLElement>();

//   render() {
//     return <div ref={this.myRef} />;
//   }
// }

const defaultNotes = "C#5/q, B4, A4, G#4";

export const Score = ({ notes = defaultNotes }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [id] = useState(_.uniqueId("vexflow-"));

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

    system
      .addStave({
        voices: [score.voice(score.notes(notes, { stem: "up" }))],
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
