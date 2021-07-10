import { Input, MIDIFilter, MIDINote, useMIDINote } from "@react-midi/hooks";
import { useEffect, useState } from 'react';
import { useConnectInput } from "./useConnectInput";

export const useMIDINotes = (input: Input, filter: MIDIFilter = {}) => {
  useConnectInput(input);
  const [notes, setNotes] = useState<MIDINote[]>([]);
  const value = useMIDINote(input, filter);
  useEffect(() => {
    if (!input || !value) return;
    if (value.on) setNotes([...notes, value]);
    else setNotes(notes.filter((n) => n.note !== value.note)); // Note off, remove note from array (maybe check for channel?)
  }, [input, value]);
  return notes;
};
