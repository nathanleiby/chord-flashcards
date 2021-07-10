import { Input, useMIDI } from "@react-midi/hooks";
import { Chord, Midi, Note } from "@tonaljs/tonal";
import React from 'react';
import './App.css';
import logo from './logo.svg';
import { useMIDINotes } from "./useNotes"; // TODO: my version of fn

// TODO: autoformat with prettier
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
        <p>
        </p>
      </header>
    </div>
  );
}

type MIDINoteLogParams = {
  input: Input;
}

const MIDINoteLog = ({ input }: MIDINoteLogParams) => {
  const midiNotes = useMIDINotes(input, { channel: 1 }); // Intially returns []
  const noteNames = midiNotes.map((n) => Midi.midiToNoteName(n.note))
  const simpleNames = noteNames.map(n => Note.pitchClass(n));
  return (
    <div>
      <p>
        Playing notes: {noteNames.join(', ')}
      </p>
      <p>
        Chord name: {Chord.detect(noteNames).join(', ')}
      </p>
    </div>
  );
};

export default App;
