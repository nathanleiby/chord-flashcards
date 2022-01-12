import {
  Button,
  ChakraProvider,
  Flex,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Text,
} from "@chakra-ui/react";
import { faVolumeMute, faVolumeUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMIDI } from "@react-midi/hooks";
import * as _ from "lodash";
import React, { useState } from "react";
import { KeyboardShortcuts, MidiNumbers, Piano } from "react-piano";
import "react-piano/dist/styles.css";
import { SizeMe } from "react-sizeme";
import "./App.css";
import { compareNotes } from "./compare";
import SoundfontProvider from "./SoundfontProvider";
import Stopwatch from "./Stopwatch";
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
  const [gainValue, setGainValue] = useState(100);
  const [isMuted, setIsMuted] = useState(false);

  const targetChord = targetChordSequence[targetChordSequenceIdx];

  const midiNotes = useMIDINotes(inputs[0], { channel: 1 }); // Intially returns []
  midiNotes.sort((a, b) => a.note - b.note);
  const midiNumbers = midiNotes.map((n) => n.note);

  const activeNotes = _.uniq(_.concat(reactPianoNotes, midiNumbers));

  const targetNotes = targetChord.notes;

  const normalizedGain = gainValue / 100; // scale to [0,1]
  const effectiveGain = isMuted ? 0 : normalizedGain;

  const gameNextChord = () => {
    const newIdx = (targetChordSequenceIdx + 1) % targetChordSequence.length;
    setTargetChordSequenceIdx(newIdx);

    if (newIdx == 0) {
      // if you completed the previous sequence, now change to another random ii-V-I
      setTargetChordSequence(chooseRandomChordSequence());
    }
  };

  const { correctNotes, isCorrect } = compareNotes(targetNotes, activeNotes);

  if (isCorrect) {
    gameNextChord();
  }

  return (
    <ChakraProvider>
      <Flex alignContent="space-between">
        <Score chord={targetChord} correctNotes={correctNotes} />
        <Flex flexDirection="column">
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
        </Flex>

        <Stopwatch />

        <Flex flexDirection="column">
          <Text fontSize="lg">Volume:</Text>
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
          <Button
            colorScheme="teal"
            size="md"
            onClick={() => {
              setIsMuted(!isMuted);
            }}
          >
            {isMuted ? (
              <>
                <FontAwesomeIcon icon={faVolumeUp} />
                <Text>Unmute</Text>
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faVolumeMute} />
                <Text>Mute</Text>
              </>
            )}
          </Button>
        </Flex>
      </Flex>
      <div>
        <MIDINoteLog
          targetNotes={targetNotes}
          activeNotes={activeNotes}
          reactPianoNotes={reactPianoNotes}
          setReactPianoNotes={setReactPianoNotes}
          gainValue={effectiveGain}
        />
      </div>
      <div className="App"></div>
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
  const first = MidiNumbers.fromNote("Bb2");
  const last = MidiNumbers.fromNote("D4");

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
  const { missingNotes, extraNotes, isCorrect } = compareNotes(
    targetNotes,
    activeNotes
  );

  return (
    <div>
      <DisplayPiano
        activeNotes={activeNotes}
        reactPianoNotes={reactPianoNotes}
        setReactPianoNotes={setReactPianoNotes}
        gainValue={gainValue}
      />
    </div>
  );
};

export default App;
