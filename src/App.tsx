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
import * as _ from "lodash";
import { useState } from "react";
import "react-piano/dist/styles.css";
import "./App.css";
import { compareNotes } from "./compare";
import { ChordSelector, getNextRoot, majorTwoFiveOne } from "./game";
import { PianoKeys } from "./PianoKeys";
import Stopwatch from "./Stopwatch";
import { useMIDINotes } from "./useNotes"; // TODO: my version of fn
import { Score } from "./Vexflow";

const initialRoot = getNextRoot(ChordSelector.Random, "");
const initialChordSequence = majorTwoFiveOne(initialRoot);

function App() {
  const { inputs } = useMIDI();

  const [reactPianoNotes, setReactPianoNotes] = useState([]);
  const [targetChordSequence, setTargetChordSequence] =
    useState(initialChordSequence);
  const [targetChordSequenceIdx, setTargetChordSequenceIdx] = useState(0);
  const [currentRoot, setCurrentRoot] = useState(initialRoot);
  const [chordSelector, setChordSelector] = useState(ChordSelector.Random);
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
      const nextRoot = getNextRoot(chordSelector, currentRoot);
      setCurrentRoot(nextRoot);
      setTargetChordSequence(majorTwoFiveOne(nextRoot));
    }
  };

  const { correctNotes, isCorrect } = compareNotes(targetNotes, activeNotes);

  // useEffect(() => {
  if (isCorrect) {
    gameNextChord();
  }
  // }, [isCorrect]);

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
            onChange={(v) => setChordSelector(v as ChordSelector)}
            value={chordSelector}
          >
            <Stack direction="row">
              <Radio value={ChordSelector.Random}>Random</Radio>
              <Radio value={ChordSelector.HalfStep}>Half Step +</Radio>
              <Radio value={ChordSelector.WholeStep}>Whole Step +</Radio>
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
    </ChakraProvider>
  );
}

export default App;
