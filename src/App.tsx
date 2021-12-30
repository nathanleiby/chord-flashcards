import { Button, ChakraProvider } from "@chakra-ui/react";
import {
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMIDI } from "@react-midi/hooks";
import { Midi, Note } from "@tonaljs/tonal";
import * as _ from "lodash";
import { noop } from "lodash";
import React, { useState } from "react";
import { KeyboardShortcuts, MidiNumbers, Piano } from "react-piano";
import "react-piano/dist/styles.css";
import "./App.css";
import { majorSeventhChords } from "./TwoFiveOne";
import { useMIDINotes } from "./useNotes"; // TODO: my version of fn

const chooseRandomChord = () => _.sample(majorSeventhChords)!;

function App() {
  const { inputs } = useMIDI();

  const [reactPianoNotes, setReactPianoNotes] = useState([]);
  const [targetChord, setTargetChord] = useState(chooseRandomChord());

  const midiNotes = useMIDINotes(inputs[0], { channel: 1 }); // Intially returns []
  midiNotes.sort((a, b) => a.note - b.note);
  const midiNumbers = midiNotes.map((n) => n.note);
  console.log("midiNumbers", midiNumbers.join(", "));

  const activeNotes = _.uniq(_.concat(reactPianoNotes, midiNumbers));

  const targetNotes = targetChord.notes;

  return (
    <ChakraProvider>
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
              setTargetChord(chooseRandomChord());
            }}
          >
            Next Chord
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
    console.log(`stopNoteInputHandler: ${midiNote}`);
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
    <Piano
      noteRange={{ first, last }}
      playNote={noop}
      stopNote={noop}
      onPlayNoteInput={onPlayNoteInputHandler}
      onStopNoteInput={onStopNoteInputHandler}
      activeNotes={activeNotes}
      width={1000}
      keyboardShortcuts={keyboardShortcuts}
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
  const noteNames = activeNotes.map((n) => Midi.midiToNoteName(n));

  // by default, simpleNames use flats.
  // if our target notes are sharp, we need to use sharps.
  const useEnharmonic = _.some(targetNotes, (n) => n.includes("#"));
  const simpleNames = noteNames.map((n) => {
    const simpleName = Note.pitchClass(n);
    return useEnharmonic ? Note.enharmonic(simpleName) : simpleName;
  });

  const missing = _.difference(targetNotes, simpleNames);
  const extra = _.difference(simpleNames, targetNotes);
  const isMatch = missing.length === 0 && extra.length === 0;

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

export default App;
