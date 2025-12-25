import { ViewIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Card,
  Center,
  Flex,
  HStack,
  Radio,
  RadioGroup,
  Spacer,
  Stack,
  Switch,
  Text,
  useBoolean,
} from "@chakra-ui/react";
import * as _ from "lodash";
import { useEffect, useState } from "react";
import { useMIDI } from "react-midi-hooks";
import "react-piano/dist/styles.css";
import { compareExactNotes, compareNotes } from "../lib/compare";
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
import { voicingToKeyboard } from "../lib/TwoFiveOne";
import { useMIDINotes } from "../lib/useNotes"; // TODO: my version of fn
import "./App.css";
import ChordSymbol from "./ChordSymbol";
import { PianoKeys } from "./PianoKeys";
import Stopwatch from "./Stopwatch";
import { Score } from "./Vexflow";
import VolumeControl from "./VolumeControl";

export default function Game() {
  // keyboard input (midi, keyboard via react-piano)
  const [reactPianoNotes, setReactPianoNotes] = useState([]);

  const { inputs } = useMIDI();
  const midiNotes = useMIDINotes(inputs[0], { channel: 1 }); // Intially returns []
  midiNotes.sort((a, b) => a.note - b.note);
  const midiNumbers = midiNotes.map((n) => n.note);

  const activeNotes = _.uniq(_.concat(reactPianoNotes, midiNumbers));

  // audio
  const [gainValue, setGainValue] = useState<number>(1.0);

  // game
  const [lastTimestamp, setLastTimestamp] = useState(new Date());
  const [gameState, setGameState] = useState<GameState>(initGameState());
  const [memoryMode, setMemoryMode] = useBoolean(false);
  const [exactMatching, setExactMatching] = useBoolean(true);

  const targetChord =
    gsChordSequence(gameState)[gameState.targetChordSequenceIdx];
  const targetNotes = targetChord.notes;

  // Get exact notes with octaves for exact matching mode
  const targetNotesWithOctave = voicingToKeyboard(_.clone(targetNotes));

  const gameNextChord = (forceReset = false) => {
    setGameState(gsNextChord(gameState, forceReset));
  };

  // Use exact matching if enabled, otherwise use pitch class matching
  const { correctNotes, isCorrect } = exactMatching
    ? compareExactNotes(targetNotesWithOctave, activeNotes)
    : compareNotes(targetNotes, activeNotes);

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
          memoryMode,
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
                    {memoryMode ? undefined : (
                      <Score
                        chord={chord}
                        correctNotes={isCurrent ? correctNotes : []}
                      />
                    )}
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
            <HStack>
              <ViewIcon />
              <Text>Memory Mode</Text>
              <Switch
                isChecked={memoryMode}
                onChange={(v) => setMemoryMode.toggle()}
              />
            </HStack>
            <HStack>
              <Text>Exact Matching</Text>
              <Switch
                isChecked={exactMatching}
                onChange={(v) => setExactMatching.toggle()}
              />
              <Text fontSize="sm" color="gray.500">
                (Match exact notes with octaves)
              </Text>
            </HStack>

            <Stopwatch />
            <VolumeControl
              onVolumeChange={(gain: number) => setGainValue(gain)}
            />
          </Flex>
        </Box>
      </Flex>

      <Spacer height={4} />

      <PianoKeys
        activeNotes={activeNotes}
        reactPianoNotes={reactPianoNotes}
        setReactPianoNotes={setReactPianoNotes}
        gainValue={gainValue}
      />
    </>
  );
}
