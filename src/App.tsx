import {
  Button,
  ChakraProvider,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Text,
} from "@chakra-ui/react";
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
import { SizeMe } from "react-sizeme";
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
  const [gainValue, setGainValue] = React.useState(100);

  const targetChord = targetChordSequence[targetChordSequenceIdx];

  const midiNotes = useMIDINotes(inputs[0], { channel: 1 }); // Intially returns []
  midiNotes.sort((a, b) => a.note - b.note);
  const midiNumbers = midiNotes.map((n) => n.note);

  const activeNotes = _.uniq(_.concat(reactPianoNotes, midiNumbers));

  const targetNotes = targetChord.notes;

  return (
    <ChakraProvider>
      <Score chord={targetChord} />
      <div>
        <MIDINoteLog
          targetNotes={targetNotes || []}
          activeNotes={activeNotes}
          reactPianoNotes={reactPianoNotes}
          setReactPianoNotes={setReactPianoNotes}
          gainValue={gainValue}
        />
      </div>
      <div className="App">
        <p>Target Note(s): {targetNotes.join(", ")}</p>
        <div>
          <p>Target Chord: {targetChord.name}</p>

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
          <Text fontSize="sm">Volume:</Text>
          <Slider
            aria-label="slider-ex-4"
            defaultValue={gainValue}
            min={0}
            max={100}
            colorScheme="teal"
            onChange={(v) => setGainValue(v)}
          >
            <SliderTrack bg="red.100">
              <SliderFilledTrack bg="tomato" />
            </SliderTrack>
            <SliderThumb boxSize={6} />
          </Slider>
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
  gainValue: number;
};

type SoundfontProviderRenderArgs = {
  isLoading: boolean;
  playNote: MidiNoteHandler;
  stopNote: MidiNoteHandler;
};

const DisplayPiano = (params: DisplayPianoParams) => {
  const { activeNotes, reactPianoNotes, setReactPianoNotes, gainValue } =
    params;
  const first = MidiNumbers.fromNote("c3");
  const last = MidiNumbers.fromNote("c5");

  const onPlayNoteInputHandler: MidiNoteHandler = (midiNote) => {
    const newNotes = Array.from(new Set(reactPianoNotes).add(midiNote));
    setReactPianoNotes(newNotes);
  };

  const onStopNoteInputHandler: MidiNoteHandler = (midiNote) => {
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
    <SizeMe>
      {({ size }) => {
        return (
          <div>
            <SoundfontProvider
              instrumentName="acoustic_grand_piano"
              audioContext={audioContext}
              hostname={soundfontHostname}
              gain={gainValue}
              render={(args: SoundfontProviderRenderArgs) => (
                <Piano
                  noteRange={{ first, last }}
                  width={size.width}
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
          </div>
        );
      }}
    </SizeMe>
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
  gainValue,
}: MIDINoteLogParams & DisplayPianoParams) => {
  const [missing, extra, isMatch] = compareNotes(targetNotes, activeNotes);

  return (
    <div>
      <DisplayPiano
        activeNotes={activeNotes}
        reactPianoNotes={reactPianoNotes}
        setReactPianoNotes={setReactPianoNotes}
        gainValue={gainValue / 100} // scale to [0,1]
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
  const foundNotes = [];
  const extraNotes = [];
  for (const a of activeNotes) {
    let found = false;
    for (const t of targetNotes) {
      const aN = Note.pitchClass(Note.fromMidi(a));
      if (t === aN || Note.enharmonic(aN) === t) {
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
