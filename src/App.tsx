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
import { Chord, Interval, Note } from "@tonaljs/tonal";
import * as _ from "lodash";
import React, { useState } from "react";
import "react-piano/dist/styles.css";
import "./App.css";
import { compareNotes } from "./compare";
import { PianoKeys } from "./PianoKeys";
import Stopwatch from "./Stopwatch";
import { getVoicing } from "./TwoFiveOne";
import { useMIDINotes } from "./useNotes"; // TODO: my version of fn
import { Score } from "./Vexflow";

const chooseRandomChordSequence = () => {
  const one = "C";
  const two = Note.transpose(one, Interval.fromSemitones(2));
  const five = Note.transpose(one, Interval.fromSemitones(7));

  const chord1 = Chord.getChord("m7", two);
  // TODO: revisit this hack where we overrides notes in the chord..
  // another option: pass along chord symbol instead of parsing Chord Type in <Score>
  chord1.notes = getVoicing(two, "minor", 7);

  const chord2 = Chord.getChord("7", five);
  chord2.notes = getVoicing(five, "dominant", 3);

  const chord3 = Chord.getChord("M7", one);
  chord3.notes = getVoicing(one, "major", 7);

  return [chord1, chord2, chord3];
};

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
      <PianoKeys
        activeNotes={activeNotes}
        reactPianoNotes={reactPianoNotes}
        setReactPianoNotes={setReactPianoNotes}
        gainValue={effectiveGain}
      />
    </ChakraProvider>
  );
}

export default App;
