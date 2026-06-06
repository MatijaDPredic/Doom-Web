# Doom WASM Web Port

Early-stage school project focused on porting DOOM to the browser with WebAssembly and building a custom web interface around it.

## Status

This repository is in the setup / early integration phase.

The project folder already contains the DoomGeneric engine source as the upstream base for the port.
Current work is focused on integrating that engine with a browser/WebAssembly build pipeline.

## Goal

The goal is to run DOOM in the browser through a WebAssembly-based build while separating the gameplay view and the website interface:

- game screen rendered in a canvas
- HUD and surrounding UI built with HTML, CSS, and JavaScript

## Notes

This repo is intentionally being built step by step.
Documentation and structure may change as the WebAssembly workflow is finalized.

## License

Code in this repository is licensed under GPL-2.0-or-later unless stated otherwise.

Game assets and other third-party content are subject to their own licenses and are not automatically covered by this repository license.