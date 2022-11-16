import {
  Button,
  ChakraProvider,
  Flex,
  Radio,
  RadioGroup,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Stack,
  Text,
} from "@chakra-ui/react";
import { faVolumeMute, faVolumeUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMIDI } from "@react-midi/hooks";
import { useLiveQuery } from "dexie-react-hooks";
import * as _ from "lodash";
import { useEffect, useState } from "react";
import "react-piano/dist/styles.css";
import "./App.css";
import { compareNotes } from "./compare";
import { db } from "./db";
import {
  ChordProgression,
  getNextRoot,
  LowNote,
  majorTwoFiveOne,
  minorTwoFiveOne,
  PracticeMovement,
  PracticeMovementDirection,
} from "./game";
import { PianoKeys } from "./PianoKeys";
import Stopwatch from "./Stopwatch";
import { BottomNote } from "./TwoFiveOne";
import { useMIDINotes } from "./useNotes"; // TODO: my version of fn
import { Score } from "./Vexflow";

const lowNoteScaleDegreeToBottomNote = (lowNote: LowNote): BottomNote => {
  switch (lowNote) {
    case LowNote.Three:
      return 3;
    case LowNote.Seven:
      return 7;
    // TODO: support others like 1, or random
    default:
      return 3;
  }
};

const getChordProgressionFn = (cp: ChordProgression) => {
  switch (cp) {
    case ChordProgression.MajorTwoFiveOne:
      return majorTwoFiveOne;
    case ChordProgression.MinorTwoFiveOne:
      return minorTwoFiveOne;
  }
};

// TODO: move initial setup these to a useEffect instead? also push as much logic as possible into game.ts
// TODO: Also, potentially add a debug mode if useful to override some values to non-randomized
const initialChordProgression = ChordProgression.MajorTwoFiveOne;
const isMajor = initialChordProgression == ChordProgression.MajorTwoFiveOne;
const initialDirection = PracticeMovementDirection.Down;
const initialRoot = getNextRoot(
  PracticeMovement.Random,
  "",
  initialDirection,
  isMajor
);
// const initialRoot: NoteLiteral = "C";
const initialPracticeMovement = PracticeMovement.HalfStep;
const initialLowNoteScaleDegree = LowNote.Three;
const chordProgressionFn = getChordProgressionFn(initialChordProgression);
const initialChordSequence = chordProgressionFn(
  initialRoot,
  lowNoteScaleDegreeToBottomNote(initialLowNoteScaleDegree)
);

function App() {
  const { inputs } = useMIDI();

  const [reactPianoNotes, setReactPianoNotes] = useState([]);
  const [lastTimestamp, setLastTimestamp] = useState(new Date());
  const [targetChordSequence, setTargetChordSequence] =
    useState(initialChordSequence);
  const [targetChordSequenceIdx, setTargetChordSequenceIdx] = useState(0);
  const [currentRoot, setCurrentRoot] = useState(initialRoot);
  const [practiceMovement, setPracticeMovement] = useState(
    initialPracticeMovement
  );
  const [practiceMovementDirection, setPracticeMovementDirection] =
    useState(initialDirection);
  const [chordProgression, setChordProgression] = useState(
    initialChordProgression
  );
  const [lowNoteScaleDegree, setLowNoteScaleDegree] = useState(LowNote.Three);
  const [gainValue, setGainValue] = useState(100);
  const [isMuted, setIsMuted] = useState(false);

  const midiNotes = useMIDINotes(inputs[0], { channel: 1 }); // Intially returns []
  midiNotes.sort((a, b) => a.note - b.note);
  const midiNumbers = midiNotes.map((n) => n.note);

  const activeNotes = _.uniq(_.concat(reactPianoNotes, midiNumbers));

  const targetChord = targetChordSequence[targetChordSequenceIdx];
  const targetNotes = targetChord.notes;

  const normalizedGain = gainValue / 100; // scale to [0,1]
  const effectiveGain = isMuted ? 0 : normalizedGain;

  const gameNextChord = (forceReset = false) => {
    let newIdx = (targetChordSequenceIdx + 1) % targetChordSequence.length;
    if (forceReset) {
      newIdx = 0;
    }

    setTargetChordSequenceIdx(newIdx);

    if (newIdx == 0) {
      // if you completed the previous sequence, now change to another random ii-V-I
      const isMajor = chordProgression == ChordProgression.MajorTwoFiveOne;
      const nextRoot = getNextRoot(
        practiceMovement,
        currentRoot,
        practiceMovementDirection,
        isMajor
      );
      setCurrentRoot(nextRoot);

      const chordProgressionFn = getChordProgressionFn(chordProgression);
      const newChordSequence = chordProgressionFn(
        nextRoot,
        lowNoteScaleDegreeToBottomNote(lowNoteScaleDegree)
      );
      setTargetChordSequence(newChordSequence);
    }
  };

  const { correctNotes, isCorrect } = compareNotes(targetNotes, activeNotes);

  useEffect(() => {
    if (isCorrect) {
      const newLastTimestamp = new Date();
      // record played chord
      const asyncWrapper = async () => {
        const id = await db.playedChords.add({
          name: targetChordSequence[targetChordSequenceIdx].symbol,
          timeToSuccess:
            (newLastTimestamp.getTime() - lastTimestamp.getTime()) / 1000,
          madeAnyMistake: false, // TODO: revisit how to manage this
        });
        console.debug({ id });
      };
      asyncWrapper().catch(console.error);

      setLastTimestamp(newLastTimestamp);

      // move to next chord
      gameNextChord();
    }
  }, [isCorrect]);

  return (
    <ChakraProvider>
      <Flex alignContent="space-between">
        {_.map(targetChordSequence, (chord, chordIdx) => {
          const isCurrent = chordIdx == targetChordSequenceIdx;
          return (
            <div
              key={chordIdx}
              className={isCurrent ? "--selected" : "--notSelected"}
            >
              <Score
                chord={chord}
                correctNotes={isCurrent ? correctNotes : []}
              />
            </div>
          );
        })}
        <Flex flexDirection="column" alignContent="space-around">
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
              setTargetChordSequenceIdx(-1);
              gameNextChord(true);
            }}
          >
            Next 2-5-1 (ii-V7-IM7)
          </Button>
          <RadioGroup
            onChange={(v) => setPracticeMovement(v as PracticeMovement)}
            value={practiceMovement}
          >
            <Stack direction="row">
              <Radio value={PracticeMovement.HalfStep}>Half Step</Radio>
              <Radio value={PracticeMovement.WholeStep}>Whole Step</Radio>
              <Radio value={PracticeMovement.CircleOfFifths}>
                Circle of 5ths
              </Radio>
              <Radio value={PracticeMovement.Random}>Random</Radio>
            </Stack>
          </RadioGroup>
          <RadioGroup
            onChange={(v) =>
              setPracticeMovementDirection(v as PracticeMovementDirection)
            }
            value={practiceMovementDirection}
          >
            <Stack direction="row">
              <Radio value={PracticeMovementDirection.Down}>Down</Radio>
              <Radio value={PracticeMovementDirection.Up}>Up</Radio>
            </Stack>
          </RadioGroup>
          <RadioGroup
            onChange={(v) => setChordProgression(v as ChordProgression)}
            value={chordProgression}
          >
            <Stack direction="row">
              <Radio value={ChordProgression.MajorTwoFiveOne}>
                Major 2-5-1
              </Radio>
              <Radio value={ChordProgression.MinorTwoFiveOne}>
                Minor 2-5-1
              </Radio>
            </Stack>
          </RadioGroup>
          <RadioGroup
            onChange={(v) => setLowNoteScaleDegree(v as LowNote)}
            value={lowNoteScaleDegree}
          >
            <Stack direction="row">
              <Radio value={LowNote.Three}>3</Radio>
              <Radio value={LowNote.Seven}>7</Radio>
            </Stack>
          </RadioGroup>
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
      <Results />
    </ChakraProvider>
  );
}

const Results = () => {
  const results = useLiveQuery(() => db.playedChords.toArray());
  // TODO: try dexie to do DB query
  const groupedResults = _.groupBy(results, (r) => r.name);
  const sortedKeys = Object.keys(groupedResults).sort();

  return (
    <ul>
      {_.map(sortedKeys, (key) => {
        const results = groupedResults[key];
        return (
          <li key={key}>
            {key}, attempts: {results.length}, avg time to success:{" "}
            {_.sum(_.map(results, (r) => r.timeToSuccess)) / results.length}
          </li>
        );
      })}
    </ul>
  );
};

export default App;
