import { KeyboardShortcuts, MidiNumbers, Piano } from "react-piano";
import "react-piano/dist/styles.css";
import { SizeMe } from "react-sizeme";
import SoundfontProvider from "../lib/SoundfontProvider";
import "./App.css";

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
  // match my two octaive Akai MPK
  const first = MidiNumbers.fromNote("C3");
  const last = MidiNumbers.fromNote("C5");

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
