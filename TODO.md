# TODO

## Gameplay

- [ ] "next chord" - generate a new set of notes to play
  - [x] Via page refresh
  - [x] Via a button onscreen
  - [ ] Via a midi note (e.g. drumpad for "next chord")
  - [ ] keyboard shortcut for next chord (right bracket?)
  - [x] When you get it correct - game like
- [ ] (optional) show changing key signature of root chord vs accidentals on the chord
- [ ] Fix case where one chord in triplet is in another octave (e.g. root = Db currently codes this .. Ebm7 is octave low)
- [ ] gameify / UX
  - [ ] show upcoming chord like tetris
- [ ] Add some kind of timer/scorekeeper (why? something to motivate you. help understad which chords are slower to play)
  - [ ] countdown and success failure
  - [ ] "right on first try!" vs needed fix(es)
- [ ] Improve the training, e.g.
  - [...] track time to correct for each chord type
  - [ ] suggest exercises
- [...] major ii V Is
  - [x] add minor and dominant chord types
  - [ ] Show 3 chords at once
  - [ ] Check off each one in succession
- [ ] add better UX for web midi and audio enabling issues
  - [ ] `[Deprecation] Web MIDI will ask a permission to use even if the sysex is not specified in the MIDIOptions since around M82, around May 2020. See https://www.chromestatus.com/feature/5138066234671104 for more details.`
  - [ ] `The AudioContext was not allowed to start. It must be resumed (or created) after a user gesture on the page. https://goo.gl/7K7WLu`
- [ ] More specific voicings
  - [ ] Add some m7 voicings, e.g. Kenny Barron (11 on top) or Herbie Hancock version
  - [ ] Drop 2
  - [ ] Cookie Cutter https://www.youtube.com/watch?v=hiQdy_q-F2U&t=947s
  - [ ] rootless voicings
- [ ] See if the `tokenize` method for chords is useful to use
- [ ] See if the "progressions" lib in TonalJS would be helpful https://github.com/tonaljs/tonal/tree/main/packages/progression#progressionfromromannumeralskeytonic-string-chordprogression-string--string

## DX

- [ ] Use something other than Chakra UI
- [ ] Add types for `react-piano`
  - [x] for local use, just enough
  - [ ] PR to definitely typed so others can use
  - [ ] Could also make a fork or PR to the repo to typescript it, then get types for free https://github.com/kevinsqi/react-piano
- [x] Auto deploy latest to github
  - [x] Not quite auto deploy, but can run `npm run deploy` locally to deploy latest local version.
  - [ ] in CI (https://dev.to/achukka/deploy-react-app-using-github-actions-157d)

# Future Explorations

- "Rhythm game" - play along to rhythms
  - drum variant too, not just keys
- arrangement generator
  - e.g. take a lead sheet's chords and create a full arrangement of specific chord voicings, to practice some technique
  - generate a version to provide variety or nice voice leading
- detect actual audio

# Done

- [x] Improve UI so that piano zooms to fit (ref: https://www.npmjs.com/package/react-sizeme)
- [x] highlight correct notes in green
- [x] BUG: Correct note matching is still buggy, e.g. Fb desired, but can only play E
  - [x] Solve this once and for all. actually add unit tests! dun-dun-dun!
- [x] add sound
  - [x] play note audio (ref: https://github.com/kevinsqi/react-piano#implementing-audio-playback)
  - [x] allow mute button to toggle audio on/off
  - [x] add volume control
- [x] minor ii V Is
  - [x] add new chord types
  - [x] ensure a new grouping for this sort of chord type
  - [x] BUG: can't play some notes, enharmonic input doesn't match (e.g. A doesn't match Bbb, E doesn't match Fb).
- [x] Show one or more notes to play
- [x] When played via Midi, show correctness
  - [x] Show check or X
  - [x] nice to have: color it green/red
- [x] Fix correctness for enharmonic notes (e.g. C# == Db)
- [x] Show a chord symbol, too
- [x] Display played notes on a keyboard
  - [x] `react-piano`
- [x] Merge with prior work in chord-flashcards (https://nathanleiby.github.io/chord-flashcards/) => _wontfix_
- [x] Allow input from computer keyboard, too
- [x] display notes on a staff
  - [x] use vexflow to show current chord
  - [x] jazz it up :music_note: (https://github.com/0xfe/vexflow/wiki/Chord-Symbols-and-Chord-Changes)
- [x] BUG: chords include some wrong and/or mis-named notes (ex. Gm7 includes an F-flat)
  - [x] Possible cause: notes aren't sorted in 'music' order (C4 D4 E4 F4 G4 A4 B4), so accidental is on wrong note.
        See related console warning: `Warning: Unsorted keys in note will be sorted. See https://github.com/0xfe/vexflow/issues/104 for details`
  - [x] some still note working, e.g `C#` in `AC#EG` not matching `Db`
