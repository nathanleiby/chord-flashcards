// db.ts
import Dexie, { Table } from "dexie";

export interface PlayedChord {
  id?: number;
  name: string;
  timeToSuccess: number;
  madeAnyMistake: boolean;
  memoryMode: boolean;
}

export class MySubClassedDexie extends Dexie {
  playedChords!: Table<PlayedChord>;

  constructor() {
    super("myDatabase");
    this.version(2).stores({
      playedChords: "++id, name, timeToSuccess, madeAnyMistake, memoryMode", // Primary key and indexed props
    });
  }
}

export const db = new MySubClassedDexie();
