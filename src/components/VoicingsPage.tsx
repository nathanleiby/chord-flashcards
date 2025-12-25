import {
  Box,
  Card,
  Center,
  Flex,
  FormLabel,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  Spacer,
} from "@chakra-ui/react";
import { Midi } from "@tonaljs/tonal";
import { useState } from "react";
import "react-piano/dist/styles.css";
import "./App.css";
import { PianoKeys } from "./PianoKeys";
import { ScoreV2 } from "./ScoreV2";
import { Voicings } from "./voicings";
import VolumeControl from "./VolumeControl";
export default function ExplorePage() {
  // keyboard input (midi, keyboard via react-piano)
  const [reactPianoNotes, setReactPianoNotes] = useState([]);

  const [voicing, setVoicing] =
    useState<keyof typeof Voicings>("m7: Kenny Baron");
  const [transpose, setTranspose] = useState(0);

  const activeNotes = Voicings[voicing].map((n) => Midi.toMidi(n)! + transpose);

  // audio
  const [gainValue, setGainValue] = useState<number>(100);

  return (
    <>
      <FormLabel>Voicing</FormLabel>
      <Select
        onChange={(event) => {
          setVoicing(event.target.value as keyof typeof Voicings);
        }}
      >
        {Object.keys(Voicings).map((k) => {
          return (
            <option key={k} value={k} selected={k === voicing}>
              {k}
            </option>
          );
        })}
      </Select>
      <FormLabel>Tranpose (half steps)</FormLabel>
      <NumberInput
        value={transpose}
        onChange={(v) => setTranspose(parseInt(v) % 12)}
      >
        <NumberInputField />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>

      <Spacer h={4} />

      <Flex>
        <Box flex="6" paddingRight={4}>
          <Card>
            <Center>
              <div>
                <ScoreV2 activeMidiNotes={activeNotes} />
              </div>
            </Center>
          </Card>
        </Box>
      </Flex>

      <Spacer height={4} />

      <PianoKeys
        activeNotes={activeNotes}
        reactPianoNotes={reactPianoNotes}
        setReactPianoNotes={setReactPianoNotes}
        gainValue={gainValue}
      />

      <Spacer height={4} />

      <Center>
        <Box width="25%">
          <VolumeControl
            onVolumeChange={(gain: number) => setGainValue(gain)}
          />
        </Box>
      </Center>
    </>
  );
}
