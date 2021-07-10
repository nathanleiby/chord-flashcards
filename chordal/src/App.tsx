import { Input, useMIDI } from "@react-midi/hooks";
import { Chord, ChordType, Midi, Note } from "@tonaljs/tonal";
import React from "react";
import "./App.css";
import logo from "./logo.svg";
import { useMIDINotes } from "./useNotes"; // TODO: my version of fn

// TODO: get automated add/cleanup of imports working

function App() {
  const { inputs } = useMIDI();
  if (inputs.length < 1) return <div>No MIDI Inputs</div>;
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          <MIDINoteLog input={inputs[0]} />
        </p>
        <div>
          Chord Types:
          <ul>
            {ChordType.all()
              .filter((ct) => ct.intervals.length === 3)
              .map((ct) => (
                <li>{ct.name}</li>
              ))}
          </ul>
        </div>
      </header>
    </div>
  );
}

type MIDINoteLogParams = {
  input: Input;
};

const MIDINoteLog = ({ input }: MIDINoteLogParams) => {
  const midiNotes = useMIDINotes(input, { channel: 1 }); // Intially returns []
  midiNotes.sort((a, b) => a.note - b.note);
  const noteNames = midiNotes.map((n) => Midi.midiToNoteName(n.note));
  const simpleNames = noteNames.map((n) => Note.pitchClass(n));
  return (
    <div>
      <p>Playing notes: {simpleNames.join(", ")}</p>
      <p>Chord name: {Chord.detect(noteNames).join(", ")}</p>
    </div>
  );
};

export default App;
