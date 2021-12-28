import {
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Input, useMIDI } from "@react-midi/hooks";
import { Chord, Midi, Note } from "@tonaljs/tonal";
import * as _ from "lodash";
import React from "react";
import "./App.css";
import { majorSeventhChords } from "./TwoFiveOne";
import { useMIDINotes } from "./useNotes"; // TODO: my version of fn

function App() {
  const { inputs } = useMIDI();
  const targetChord = _.sample(majorSeventhChords)!;
  const targetNotes = targetChord.notes;
  if (inputs.length < 1) return <div>No MIDI Inputs</div>;
  return (
    <div className="App">
      <header className="App-header">
        <p>Target Chord: {targetChord.name}</p>
        <p>Target Note(s): {targetNotes.join(", ")}</p>
        <div>
          <MIDINoteLog input={inputs[0]} targetNotes={targetNotes || []} />
        </div>
        {/* <div>
          Chord Types:
          <ul>
            {ChordType.all()
              .filter((ct) => ct.intervals.length === 3)
              .map((ct) => (
                <li>{ct.name}</li>
              ))}
          </ul>
        </div> */}
      </header>
    </div>
  );
}

type MIDINoteLogParams = {
  input: Input;
  targetNotes: string[];
};

const MIDINoteLog = ({ input, targetNotes }: MIDINoteLogParams) => {
  const midiNotes = useMIDINotes(input, { channel: 1 }); // Intially returns []
  midiNotes.sort((a, b) => a.note - b.note);
  const noteNames = midiNotes.map((n) => Midi.midiToNoteName(n.note));

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
      <div>
        <p>Playing notes: {simpleNames.join(", ")}</p>
        <p>Chord name: {Chord.detect(noteNames).join(", ")}</p>
      </div>
      {isMatch ? (
        <FontAwesomeIcon icon={faCheckCircle} />
      ) : (
        <FontAwesomeIcon icon={faTimesCircle} />
      )}
      {!isMatch && (
        <div>
          <p>Missingk: {missing.join(", ")}</p>
          <p>Extra: {extra.join(", ")}</p>
        </div>
      )}
    </div>
  );
};

export default App;
