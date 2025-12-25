import { Box, Card, Center, Flex, Spacer } from "@chakra-ui/react";
import { Midi } from "@tonaljs/tonal";
import * as _ from "lodash";
import { useState } from "react";
import { useMIDI } from "react-midi-hooks";
import "react-piano/dist/styles.css";
import { useMIDINotes } from "../lib/useNotes"; // TODO: my version of fn
import "./App.css";
import { PianoKeys } from "./PianoKeys";
import { ScoreV2 } from "./ScoreV2";
import VolumeControl from "./VolumeControl";

export default function ExplorePage() {
  // keyboard input (midi, keyboard via react-piano)
  const [reactPianoNotes, setReactPianoNotes] = useState([]);

  const { inputs } = useMIDI();
  const midiNotes = useMIDINotes(inputs[0], { channel: 1 }); // Intially returns []
  midiNotes.sort((a, b) => a.note - b.note);
  const midiNumbers = midiNotes.map((n) => n.note);

  const activeNotes = _.uniq(_.concat(reactPianoNotes, midiNumbers));

  // audio
  const [gainValue, setGainValue] = useState<number>(100);

  return (
    <>
      <Flex>
        {/* Chords  */}
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

      {activeNotes.map((n) => Midi.midiToNoteName(n)).join(" ")}

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
