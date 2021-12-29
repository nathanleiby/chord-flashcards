declare module "react-piano" {
  interface KeyboardShortcut {
    key: string; // TODO: This type could be constrained to valid keyboard input that can be used to trigger the shortcut
    midiNumber: number;
  }

  interface NoteRange {
    /** first is the lowest note, as a midi number */
    first: number;
    /** last is the highest note, as a midi number */
    last: number;
  }

  interface PianoProps {
    /** The range of notes to include in the keyboard */
    noteRange: NoteRange;
    /** called when you press a note */
    playNote: (midiNumber: number) => void;
    /** called when you release a note */
    stopNote: (midiNumber: number) => void;
    /** TODO */
    onPlayNoteInput?: (...args: any) => void;
    /** TODO */
    onStopNoteInput?: (...args: any) => void;
    /** TODO */
    renderNoteLabel?: (...args: any) => void;

    /** These midi notes will be highlighted on the keyboard */
    activeNotes?: number[];
    className?: string;
    disabled?: boolean;
    width?: number;
    keyboardShortcuts?: KeyboardShortcut[];
  }

  export const Piano: React.FunctionComponent<PianoProps>;
  export const MidiNumbers; // TODO
}
