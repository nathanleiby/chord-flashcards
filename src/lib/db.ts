// db.ts
import Dexie, { Table } from "dexie";

export interface PlayedChord {
  id?: number;
  name: string;
  timeToSuccess: number;
  madeAnyMistake: boolean;
}

export class MySubClassedDexie extends Dexie {
  playedChords!: Table<PlayedChord>;

  constructor() {
    super("myDatabase");
    this.version(1).stores({
      playedChords: "++id, name, timeToSuccess, madeAnyMistake", // Primary key and indexed props
    });
  }
}

export const db = new MySubClassedDexie();
