import React from "react";
import { KeyboardShortcuts, MidiNumbers, Piano } from "react-piano";
import "react-piano/dist/styles.css";
import { SizeMe } from "react-sizeme";
import "./App.css";
import { compareNotes } from "./compare";
import SoundfontProvider from "./SoundfontProvider";

const audioContext = new window.AudioContext();
const soundfontHostname = "https://d1pzp51pvbm36p.cloudfront.net";
type MidiNoteHandler = (note: number) => void;

type PianoKeysParams = {
  // TODO: proper react types
  activeNotes: any[];
  reactPianoNotes: any[]; //number[];
  setReactPianoNotes: any; //(notes: number[]) => void;
  gainValue: number;
};

type SoundfontProviderRenderArgs = {
  isLoading: boolean;
  playNote: MidiNoteHandler;
  stopNote: MidiNoteHandler;
};

export const PianoKeys = (params: PianoKeysParams) => {
  const { activeNotes, reactPianoNotes, setReactPianoNotes, gainValue } =
    params;
  const first = MidiNumbers.fromNote("Bb2");
  const last = MidiNumbers.fromNote("D4");

  const onPlayNoteInputHandler: MidiNoteHandler = (midiNote) => {
    const newNotes = Array.from(new Set(reactPianoNotes).add(midiNote));
    setReactPianoNotes(newNotes);
  };

  const onStopNoteInputHandler: MidiNoteHandler = (midiNote) => {
    const notes = new Set(reactPianoNotes);
    notes.delete(midiNote);
    const newNotes = Array.from(notes);
    setReactPianoNotes(newNotes);
  };

  const keyboardShortcuts = KeyboardShortcuts.create({
    firstNote: first,
    lastNote: last,
    keyboardConfig: KeyboardShortcuts.HOME_ROW,
  });

  return (
    <SizeMe>
      {({ size }) => {
        return (
          <div>
            <SoundfontProvider
              instrumentName="acoustic_grand_piano"
              audioContext={audioContext}
              hostname={soundfontHostname}
              gain={gainValue}
              render={(args: SoundfontProviderRenderArgs) => (
                <Piano
                  noteRange={{ first, last }}
                  width={size.width}
                  playNote={args.playNote}
                  stopNote={args.stopNote}
                  onPlayNoteInput={onPlayNoteInputHandler}
                  onStopNoteInput={onStopNoteInputHandler}
                  disabled={args.isLoading}
                  activeNotes={activeNotes}
                  keyboardShortcuts={keyboardShortcuts}
                />
              )}
            />
          </div>
        );
      }}
    </SizeMe>
  );
};

type MIDINoteLogParams = {
  targetNotes: string[];
};

const MIDINoteLog = ({
  targetNotes,
  activeNotes,
  reactPianoNotes,
  setReactPianoNotes,
  gainValue,
}: MIDINoteLogParams & PianoKeysParams) => {
  const { missingNotes, extraNotes, isCorrect } = compareNotes(
    targetNotes,
    activeNotes
  );

  return (
    <div>
      <PianoKeys
        activeNotes={activeNotes}
        reactPianoNotes={reactPianoNotes}
        setReactPianoNotes={setReactPianoNotes}
        gainValue={gainValue}
      />
    </div>
  );
};
