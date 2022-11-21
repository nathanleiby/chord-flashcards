# TODO

Next up:

- exact matching chord voicing
- one chord at a time vs only two five ones

## Gameplay

- [ ] "next chord" - generate a new set of notes to play
  - [ ] Via a midi note (e.g. drumpad for "next chord")
  - [ ] keyboard shortcut for next chord (right bracket?)
- [ ] gameify / UX
  - [ ] Crazy idea: add a mode that removes _all_ the knobs. just magically present 'what seems best to train' like Duolingo
    - [ ] build up via an implicit (or visible) curriculum.
    - [ ] could pair this with opt-in to explicit training
    - [ ] still show scores/graphs/etc so you understand the different levels/features
    - [ ] Perhaps allow you to "test in" to more advanced stuff
  - [ ] show upcoming chord like tetris
  - [ ] "memory" / hidden mode .. you have to get the voicing without seeing it, will see it appear if you get it wrong
    - fwiw, These chord symbols seem nice, too: https://chord-symbol.netlify.app/
  - [...] record results over time (trying indexdb in browser)
    - show top / bottom 5
    - visualize as chart
    - track each sequence (progression) too, not just by chord
    - track more metadata (e.g. i.e. which voicing, not just chord name)
    - fix some edge cases
      - don't start counting timer until first chord is played.
      - if mouse event occurs, reset?
      - maybe allow "pause"?
      - maybe: throw away super outliers?
- Training order:
  - [ ] Move by "suggested", which emphasizes the ones you have more trouble with, like SRS/Anki
- [...] Add some kind of timer/scorekeeper (why? something to motivate you. help understad which chords are slower to play)
  - [ ] countdown and success failure
  - [...] "right on first try!" vs needed fix(es)
- [ ] Improve the training, e.g.
  - [...] track time to correct for each chord type
  - [ ] suggest exercises
  - [ ] SRS
- [...] major ii V Is
  - [...] Check off each one in succession
- [ ] Single chords, so you can "read" any chord symbol
  - [ ] All symbols (M, m, dim, etc)
  - [ ] Extensions
  - [ ] Slash chords
- [ ] More specific voicings
  - [ ] 3 note voicings https://jazz-library.com/articles/3-note-voicings/
  - [ ] Add some m7 voicings, e.g. Kenny Barron (11 on top) or Herbie Hancock version
  - [ ] more M7 voicings https://jazztutorial.com/articles/the-jazz-piano-chord-voicing-guide-how-to-choose-which-voicings-to-play
  - [ ] Drop 2
  - [ ] Cookie Cutter https://www.youtube.com/watch?v=hiQdy_q-F2U&t=947s
  - [ ] rootless voicings
  - [ ] compatible extensions (https://github.com/tonaljs/tonal/tree/main/packages/chord#chordextendedchord-string--string)
  - [ ] so what / 4th voicings
  - [ ] Upper structures
  - [ ] Line cliche https://youtu.be/-RJQJ9CRTgM
- [ ] Voice leading
  - [ ] Given two chords, try to minimize motion between them
    - [ ] "known" voice leadings
    - [ ] random voice leadings
    - [ ] constraints (e.g. keep X in bass)
- [ ] Support various correctness comparisons: "exact voicing" vs "exact notes" vs (current) "extra notes OK"
- [ ] play bass note to anchor your rootless voicings

## Bugs

- [ ] Fix case where one chord in triad is in another octave (e.g. root = Db currently codes this .. Ebm7 is octave low)
  - this is still occuring.. (2022-11-14)
- [ ] clicking "next chord" should not count as successfully playing a chord
      seeing some examples of 0s average chord time, likely b/c mixing in super fast successive clicks?

## Usability

- [ ] Make a landing page, explain the game
      https://chakra-templates.dev/page-sections/hero
- [ ] Add an "about" page, explain who I am
      https://chakra-templates.dev/components/cards
- [ ] Make sure to highlight all notes briefly on success (sometimes it looks like just 2 or 3 notes flash green)
- [ ] (optional) show changing key signature of root chord vs accidentals on the chord
- [ ] Improve CSS layout for the buttons
- [ ] add better UX for web midi and audio enabling issues
  - [ ] `[Deprecation] Web MIDI will ask a permission to use even if the sysex is not specified in the MIDIOptions since around M82, around May 2020. See https://www.chromestatus.com/feature/5138066234671104 for more details.`
  - [ ] `The AudioContext was not allowed to start. It must be resumed (or created) after a user gesture on the page. https://goo.gl/7K7WLu`
- [ ] Export as phone app, too
  - Try React Native and/or Expo (https://reactnative.dev/ , https://github.com/react-native-community/react-native-template-typescript , https://expo.dev/)
- allow: login + sync data across machines
  - https://dexie.org/docs/Syncable/Dexie.Syncable.js
  - e.g. 'login with google' and sync via google drive or firestore
- Dark mode https://egghead.io/lessons/react-create-a-dark-mode-switcher-in-chakra-ui
- Move volume control to Navbar w/ popover, or other settings UX

## DX

- [ ] Explore other react midi hooks
  - https://github.com/matthewshirley/react-midi-hook/blob/master/example/src/App.js - v16 react is peer dep https://github.com/matthewshirley/react-midi-hook/blob/master/package.json#L26-L28
  - Existing one is causing challenges updating other packages - v16 react is peer dep https://github.com/nickroberts404/react-midi-hooks/blob/master/package.json#L12-L14
  - fork and fix: https://github.com/nathanleiby/react-midi-hooks
- [ ] Look for a better canonical representation of chords and/or voicings
  - [ ] Explore "chord symbol" lib https://chord-symbol.netlify.app/
  - [ ] explore "coltrane" ruby lib for prior art on jazz chords https://github.com/pedrozath/coltrane/tree/master/lib/coltrane
  - [ ] review this JSON repr of guitar chords (needs a script to gen?) https://gschoppe.com/js/json-chords/
  - [ ] another JSON repr https://archives.ismir.net/ismir2014/paper/000355.pdf
- [ ] Pre-generate all voicings of a kind, specifying octave so that it's clear where they should fall in keyboard range
- [ ] Explore generating a "melody matching" version of a tune (also, lots of voicings) https://jazztutorial.com/articles/the-jazz-piano-chord-voicing-guide-how-to-choose-which-voicings-to-play
- [ ] See if the "progressions" lib in TonalJS would be helpful https://github.com/tonaljs/tonal/tree/main/packages/progression#progressionfromromannumeralskeytonic-string-chordprogression-string--string
- [ ] See if the `tokenize` method for chords is useful to use
- [ ] Add types for `react-piano`
  - [ ] PR to definitely typed so others can use
  - [ ] Could also make a fork or PR to the repo to typescript it, then get types for free https://github.com/kevinsqi/react-piano
- [x] Auto deploy latest to github
  - [x] Not quite auto deploy, but can run `npm run deploy` locally to deploy latest local version.
  - [ ] in CI (https://dev.to/achukka/deploy-react-app-using-github-actions-157d)
- Try Howler for audio https://github.com/goldfire/howler.js#documentation
- Explore note/chord generation
  - https://github.com/scribbletune/scribbletune
- Simplified music rendering (try: musicxml + opensheetmusicdisplay)
  - https://opensheetmusicdisplay.org/demos/public-typescript-demo/

## Future Explorations

- play along to a lead sheet, following the suggested chords
- arrangement generator
  - e.g. take a lead sheet's chords and create a full arrangement of specific chord voicings, to practice some technique
  - generate a version to provide variety or nice voice leading
- "Rhythm game" - play along to rhythms
  - drum variant too, not just keys
- detect actual audio
- follow the bass -- ear training that you try to play a chord to match the bassline?
