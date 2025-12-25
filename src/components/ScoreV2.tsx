import { Chord, Midi, Note } from "@tonaljs/tonal";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import Vex from "vexflow";
// translates from note names to vexflow chord notation, e.g.
// input: ["A", "C#", "E"])
// output: "(C#4 E4 A4)/w"
const toVexflowChord = (targetNotes: string[]): string => {
  return `(${targetNotes.join(" ")})/w`;
};

// Determines if a note should be on treble or bass clef
// Middle C (C4) and above go to treble, below C4 goes to bass
// This follows standard grand staff notation conventions
const getClefForNote = (noteName: string): "treble" | "bass" => {
  const parsed = Note.get(noteName);
  if (!parsed.oct) {
    // If no octave, default to treble
    return "treble";
  }
  // C4 (middle C) and above go to treble clef
  // Below C4 goes to bass clef
  if (parsed.oct > 4) {
    return "treble";
  }
  if (parsed.oct < 4) {
    return "bass";
  }
  // For octave 4, C4 and above go to treble, below C4 goes to bass
  // In octave 4: C, C#, D, D#, E, F, F# typically go to bass
  // G, G#, A, A#, B typically go to treble
  // But for simplicity, we'll put C4 and above in treble
  const midiNote = Note.midi(noteName);
  if (midiNote !== null) {
    // C4 is MIDI note 60, so notes >= 60 go to treble
    return midiNote >= 60 ? "treble" : "bass";
  }
  return "treble";
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

    // Increased height to accommodate grand staff (treble + bass)
    // Each stave is about 100px tall, plus spacing, so 280px should be enough
    const vf = new Vex.Flow.Factory({
      renderer: { elementId: ref.current.id, width: 200, height: 300 },
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

    const system = appendSystem(150);

    if (activeMidiNotes.length) {
      const sortedNotes = _.map(activeMidiNotes, (n) => Midi.midiToNoteName(n));
      console.log({ sortedNotes });

      // Separate notes into treble and bass clefs
      const trebleNotes: string[] = [];
      const bassNotes: string[] = [];

      sortedNotes.forEach((noteName) => {
        const clef = getClefForNote(noteName);
        if (clef === "treble") {
          trebleNotes.push(noteName);
        } else {
          bassNotes.push(noteName);
        }
      });

      // Detect root note from the chord and add it to bass clef
      // This handles rootless voicings (e.g., B-7 voicing without the B root)
      if (trebleNotes.length > 0) {
        // Get pitch classes (notes without octaves) for chord detection
        const pitchClasses = trebleNotes.map((n) => {
          const parsed = Note.get(n);
          return parsed.pc || parsed.name;
        });

        // Detect the chord from the notes
        const detectedChords = Chord.detect(pitchClasses);
        console.log("Detected chords:", detectedChords);
        if (detectedChords.length > 0) {
          const detectedChord = Chord.get(detectedChords[0]);
          const rootNote = detectedChord.tonic;
          console.log("Root note detected:", rootNote);

          if (rootNote) {
            // Check if root note is already in bass notes
            const rootAlreadyInBass = bassNotes.some((n) => {
              const parsed = Note.get(n);
              return parsed.pc === rootNote;
            });

            // Add root note in bass clef range (octave 2 or 3) if not already present
            if (!rootAlreadyInBass) {
              // Use octave 2 for lower notes, octave 3 for higher notes
              const rootMidi = Note.midi(rootNote);
              const rootOctave = rootMidi && rootMidi < 60 ? 2 : 3; // C4 is MIDI 60
              const rootNoteWithOctave = `${rootNote}${rootOctave}`;
              console.log("Adding root note to bass:", rootNoteWithOctave);
              bassNotes.push(rootNoteWithOctave);
            }
          }
        }
      }

      console.log("Treble notes:", trebleNotes);
      console.log("Bass notes:", bassNotes);

      // Add treble clef stave
      if (trebleNotes.length > 0) {
        const trebleChord = toVexflowChord(trebleNotes);
        const trebleScoreNotes = notes(trebleChord, {
          stem: "up",
        });
        const trebleStaveParams = {
          voices: [voice(trebleScoreNotes, { time: `4/4` })],
        };
        system.addStave(trebleStaveParams).addClef("treble");
      } else {
        // Empty treble stave
        const trebleScoreNotes = notes("B4/1/r", {
          stem: "up",
        });
        const trebleStaveParams = {
          voices: [voice(trebleScoreNotes, { time: `4/4` })],
        };
        system.addStave(trebleStaveParams).addClef("treble");
      }

      // Add bass clef stave - ALWAYS show bass clef
      const bassStave =
        bassNotes.length > 0
          ? (() => {
              const bassChord = toVexflowChord(bassNotes);
              const bassScoreNotes = notes(bassChord, {
                stem: "down",
              });
              return {
                voices: [voice(bassScoreNotes, { time: `4/4` })],
              };
            })()
          : (() => {
              // Empty bass stave with a rest
              const bassScoreNotes = notes("B2/1/r", {
                stem: "down",
              });
              return {
                voices: [voice(bassScoreNotes, { time: `4/4` })],
              };
            })();

      console.log("Adding bass stave with", bassNotes.length, "notes");
      const bassStaveObj = system.addStave(bassStave);
      console.log("Bass stave object:", bassStaveObj);
      bassStaveObj.addClef("bass");
      console.log("Bass clef added to stave");
    } else {
      // No active notes - show empty grand staff
      const trebleScoreNotes = notes("B4/1/r", {
        stem: "up",
      });
      const trebleStaveParams = {
        voices: [voice(trebleScoreNotes, { time: `4/4` })],
      };
      system.addStave(trebleStaveParams).addClef("treble");

      const bassScoreNotes = notes("B2/1/r", {
        stem: "down",
      });
      const bassStaveParams = {
        voices: [voice(bassScoreNotes, { time: `4/4` })],
      };
      system.addStave(bassStaveParams).addClef("bass");
    }

    // Add brace to connect the staves (grand staff)
    // This should be done after adding all staves but before drawing
    const staves = system.getStaves();
    console.log("Number of staves in system:", staves.length);
    console.log("Staves:", staves);

    if (staves.length >= 2) {
      const context = vf.getContext();
      const brace = new Vex.Flow.StaveConnector(staves[0], staves[1]);
      brace.setType(Vex.Flow.StaveConnector.type.BRACE);
      brace.setContext(context);
      brace.draw();
    } else {
      console.warn("Expected 2 staves but found", staves.length);
    }

    vf.draw();
  }, [activeMidiNotes]);

  return (
    <div
      id={id}
      ref={ref}
      className="score"
      style={{
        width: "200px",
        height: "300px",
        minHeight: "300px",
        overflow: "visible",
      }}
    />
  );
};
