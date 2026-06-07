# Doom WASM Web Port

Early-stage school project focused on bringing DOOM to the browser with WebAssembly and building a custom web interface around it. 

## Status

This repository is still in the setup / early integration phase.

The project already includes the upstream DoomGeneric engine as the base for the port, while the current web layer is being built separately with HTML, CSS, and JavaScript.

At the moment, the interface includes a scene-based navigation prototype with:
- an exterior mansion scene
- an interior hallway scene
- a doom room scene
- clickable and keyboard-accessible hotspots
- basic screen-reader support for the SVG scenes

## Goal

The goal is to run DOOM in the browser through a WebAssembly-based build while separating the gameplay view from the surrounding website interface. 

Planned structure:
- game screen rendered in a canvas
- HUD and interface built with HTML, CSS, and JavaScript
- themed navigation and presentation around the game experience 

## Accessibility

The current prototype includes basic accessibility improvements:
- scene SVGs include accessible titles and descriptions
- interactive door hotspots can be focused with the keyboard
- hotspots can be activated with Enter and Space
- visible focus styles are included for keyboard users

## Notes

This repo is being built step by step, so structure and documentation may continue to change as the WebAssembly workflow is finalized. 

## License

Code in this repository is licensed under GPL-2.0-or-later unless stated otherwise.

Game assets and other third-party content are subject to their own licenses and are not automatically covered by this repository license. 