import {
  Box,
  Button,
  Card,
  Center,
  Flex,
  Radio,
  RadioGroup,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Spacer,
  Stack,
  Text,
} from "@chakra-ui/react";
import { faVolumeMute, faVolumeUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as _ from "lodash";
import { useEffect, useState } from "react";
import { useMIDI } from "react-midi-hooks";
import "react-piano/dist/styles.css";
import { compareNotes } from "../lib/compare";
import { db } from "../lib/db";
import {
  ChordProgression,
  GameState,
  gsChordSequence,
  gsNextChord,
  initGameState,
  LowNote,
  PracticeMovement,
  PracticeMovementDirection,
} from "../lib/game";
import { useMIDINotes } from "../lib/useNotes"; // TODO: my version of fn
import "./App.css";
import ChordSymbol from "./ChordSymbol";
import { PianoKeys } from "./PianoKeys";
import Stopwatch from "./Stopwatch";
import { Score } from "./Vexflow";

export default function Game() {
  // keyboard input (midi, keyboard via react-piano)
  const [reactPianoNotes, setReactPianoNotes] = useState([]);
  const { inputs } = useMIDI();
  const midiNotes = useMIDINotes(inputs[0], { channel: 1 }); // Intially returns []
  midiNotes.sort((a, b) => a.note - b.note);
  const midiNumbers = midiNotes.map((n) => n.note);
  const activeNotes = _.uniq(_.concat(reactPianoNotes, midiNumbers));

  // audio
  const [gainValue, setGainValue] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const normalizedGain = gainValue / 100; // scale to [0,1]
  const effectiveGain = isMuted ? 0 : normalizedGain;

  // game
  const [lastTimestamp, setLastTimestamp] = useState(new Date());
  const [gameState, setGameState] = useState<GameState>(initGameState());

  const targetChord =
    gsChordSequence(gameState)[gameState.targetChordSequenceIdx];
  const targetNotes = targetChord.notes;

  const gameNextChord = (forceReset = false) => {
    setGameState(gsNextChord(gameState, forceReset));
  };

  const { correctNotes, isCorrect } = compareNotes(targetNotes, activeNotes);

  // handle when user inputs a correct chord
  useEffect(() => {
    if (isCorrect) {
      const newLastTimestamp = new Date();
      // record played chord
      const asyncWrapper = async () => {
        const id = await db.playedChords.add({
          name: gsChordSequence(gameState)[gameState.targetChordSequenceIdx]
            .symbol,
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
    <>
      <Flex>
        {/* Chords  */}
        <Box flex="6" paddingRight={4}>
          <Card>
            <Center>
              {_.map(gsChordSequence(gameState), (chord, chordIdx) => {
                const isCurrent = chordIdx == gameState.targetChordSequenceIdx;
                return (
                  <div
                    key={chordIdx}
                    className={isCurrent ? "--selected" : "--notSelected"}
                  >
                    {chord.name} ({chord.symbol})
                    <ChordSymbol chordSymbol={chord.symbol} />
                    <Score
                      chord={chord}
                      correctNotes={isCurrent ? correctNotes : []}
                    />
                  </div>
                );
              })}
            </Center>
          </Card>
        </Box>

        {/* Controls */}
        <Box flex="4">
          <Flex flexDirection="column" alignContent="space-around">
            <Button
              colorScheme="teal"
              size="md"
              onClick={() => gameNextChord()}
            >
              Next Chord
            </Button>
            <Button
              colorScheme="teal"
              size="md"
              onClick={() => {
                gameNextChord(true);
              }}
            >
              Next 2-5-1 (ii-V7-IM7)
            </Button>
            <RadioGroup
              onChange={(v) =>
                setGameState({
                  ...gameState,
                  practiceMovement: v as PracticeMovement,
                })
              }
              value={gameState.practiceMovement}
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
                setGameState({
                  ...gameState,
                  practiceMovementDirection: v as PracticeMovementDirection,
                })
              }
              value={gameState.practiceMovementDirection}
            >
              <Stack direction="row">
                <Radio value={PracticeMovementDirection.Down}>Down</Radio>
                <Radio value={PracticeMovementDirection.Up}>Up</Radio>
              </Stack>
            </RadioGroup>
            <RadioGroup
              onChange={(v) =>
                setGameState({
                  ...gameState,
                  chordProgression: v as ChordProgression,
                })
              }
              value={gameState.chordProgression}
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
              onChange={(v) =>
                setGameState({
                  ...gameState,
                  lowNoteScaleDegree: v as LowNote,
                })
              }
              value={gameState.lowNoteScaleDegree}
            >
              <Stack direction="row">
                <Radio value={LowNote.Three}>3</Radio>
                <Radio value={LowNote.Seven}>7</Radio>
              </Stack>
            </RadioGroup>

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
        </Box>
      </Flex>

      <Spacer height={4} />

      <PianoKeys
        activeNotes={activeNotes}
        reactPianoNotes={reactPianoNotes}
        setReactPianoNotes={setReactPianoNotes}
        gainValue={effectiveGain}
      />
    </>
  );
}