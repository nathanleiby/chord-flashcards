import { Button, ChakraProvider } from "@chakra-ui/react";
import {
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMIDI } from "@react-midi/hooks";
import { Note } from "@tonaljs/tonal";
import * as _ from "lodash";
import React, { useState } from "react";
import { KeyboardShortcuts, MidiNumbers, Piano } from "react-piano";
import "react-piano/dist/styles.css";
import "./App.css";
import SoundfontProvider from "./SoundfontProvider";
import { twoFiveOnes } from "./TwoFiveOne";
import { useMIDINotes } from "./useNotes"; // TODO: my version of fn
import { Score } from "./Vexflow";

const audioContext = new window.AudioContext();
const soundfontHostname = "https://d1pzp51pvbm36p.cloudfront.net";

const chooseRandomChordSequence = () => _.sample(twoFiveOnes)!;

type MidiNoteHandler = (note: number) => void;

function App() {
  const { inputs } = useMIDI();

  const [reactPianoNotes, setReactPianoNotes] = useState([]);
  const [targetChordSequence, setTargetChordSequence] = useState(
    chooseRandomChordSequence()
  );
  const [targetChordSequenceIdx, setTargetChordSequenceIdx] = useState(0);

  const targetChord = targetChordSequence[targetChordSequenceIdx];

  const midiNotes = useMIDINotes(inputs[0], { channel: 1 }); // Intially returns []
  midiNotes.sort((a, b) => a.note - b.note);
  const midiNumbers = midiNotes.map((n) => n.note);

  const activeNotes = _.uniq(_.concat(reactPianoNotes, midiNumbers));

  const targetNotes = targetChord.notes;

  return (
    <ChakraProvider>
      <Score chord={targetChord} />
      <div className="App">
        <div>
          <p>Target Chord: {targetChord.name}</p>
          <p>Target Note(s): {targetNotes.join(", ")}</p>
          <div>
            <MIDINoteLog
              targetNotes={targetNotes || []}
              activeNotes={activeNotes}
              reactPianoNotes={reactPianoNotes}
              setReactPianoNotes={setReactPianoNotes}
            />
          </div>
          <Button
            colorScheme="teal"
            size="md"
            onClick={() => {
              setTargetChordSequenceIdx(
                (targetChordSequenceIdx + 1) % targetChordSequence.length
              );
            }}
          >
            Next Chord
          </Button>
          <Button
            colorScheme="teal"
            size="md"
            onClick={() => {
              setTargetChordSequence(chooseRandomChordSequence());
              setTargetChordSequenceIdx(0);
            }}
          >
            Next 2-5-1 (ii-V7-IM7)
          </Button>
        </div>
      </div>
    </ChakraProvider>
  );
}

type DisplayPianoParams = {
  // TODO: proper react types
  activeNotes: any[];
  reactPianoNotes: any[]; //number[];
  setReactPianoNotes: any; //(notes: number[]) => void;
};

type SoundfontProviderRenderArgs = {
  isLoading: boolean;
  playNote: MidiNoteHandler;
  stopNote: MidiNoteHandler;
};

const DisplayPiano = ({
  activeNotes,
  reactPianoNotes,
  setReactPianoNotes,
}: DisplayPianoParams) => {
  const first = MidiNumbers.fromNote("c3");
  const last = MidiNumbers.fromNote("f5");

  const onPlayNoteInputHandler = (midiNote: number) => {
    const newNotes = Array.from(new Set(reactPianoNotes).add(midiNote));
    setReactPianoNotes(newNotes);
  };

  const onStopNoteInputHandler = (midiNote: number) => {
    const notes = new Set(reactPianoNotes);
    notes.delete(midiNote);
    const newNotes = Array.from(notes);
    setReactPianoNotes(newNotes);
  };

  const keyboardShortcuts = KeyboardShortcuts.create({
    firstNote: first,
    lastNote: last,
    keyboardConfig: KeyboardShortcuts.HOME_ROW,
  });

  return (
    <SoundfontProvider
      instrumentName="acoustic_grand_piano"
      audioContext={audioContext}
      hostname={soundfontHostname}
      render={(args: SoundfontProviderRenderArgs) => (
        <Piano
          noteRange={{ first, last }}
          width={1000}
          playNote={args.playNote}
          stopNote={args.stopNote}
          onPlayNoteInput={onPlayNoteInputHandler}
          onStopNoteInput={onStopNoteInputHandler}
          disabled={args.isLoading}
          activeNotes={activeNotes}
          keyboardShortcuts={keyboardShortcuts}
        />
      )}
    />
  );
};

type MIDINoteLogParams = {
  targetNotes: string[];
};

const MIDINoteLog = ({
  targetNotes,
  activeNotes,
  reactPianoNotes,
  setReactPianoNotes,
}: MIDINoteLogParams & DisplayPianoParams) => {
  const [missing, extra, isMatch] = compareNotes(targetNotes, activeNotes);

  return (
    <div>
      <DisplayPiano
        activeNotes={activeNotes}
        reactPianoNotes={reactPianoNotes}
        setReactPianoNotes={setReactPianoNotes}
      />
      {isMatch ? (
        <FontAwesomeIcon icon={faCheckCircle} className="icon-success" />
      ) : (
        <FontAwesomeIcon icon={faTimesCircle} className="icon-failure" />
      )}
      {!isMatch && (
        <div>
          {missing.length > 0 && <p>Missing: {missing.join(", ")}</p>}
          {extra.length > 0 && <p>Extra: {extra.join(", ")}</p>}
        </div>
      )}
    </div>
  );
};

const compareNotes = (
  targetNotes: string[],
  activeNotes: number[]
): [string[], string[], boolean] => {
  // const noteNames = activeNotes.map((n) => Midi.midiToNoteName(n));

  // // by default, simpleNames use flats.
  // // if our target notes are sharp, we need to use sharps.
  // const useEnharmonic = _.some(targetNotes, (n) => n.includes("#"));
  // const simpleNames = noteNames.map((n) => {
  //   const simpleName = Note.pitchClass(n);
  //   return useEnharmonic ? Note.enharmonic(simpleName) : simpleName;
  // });

  const foundNotes = [];
  const extraNotes = [];
  for (const a of activeNotes) {
    let found = false;
    for (const t of targetNotes) {
      const tN = Note.enharmonic(t);
      const aN = Note.enharmonic(Note.pitchClass(Note.fromMidi(a)));
      if (tN === aN) {
        foundNotes.push(t);
        found = true;
        break;
      }
    }

    // keep track of extra notes
    if (!found) {
      extraNotes.push(a);
    }
  }

  const missing = _.difference(targetNotes, foundNotes);
  const extra = _.map(extraNotes, (n) => Note.pitchClass(Note.fromMidi(n)));
  const isMatch = missing.length === 0 && extraNotes.length === 0;

  return [missing, extra, isMatch];
};

export default App;
