# StreamDeck TrackAudio Plugin Development Instructions

**Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Overview

StreamDeck TrackAudio is a Node.js/TypeScript plugin for Elgato Stream Deck that provides aviation radio control integration with TrackAudio. The plugin connects via websocket to TrackAudio (localhost:49080) and manages various radio station controls, push-to-talk, volume controls, and status displays.

**This is specialized aviation software**: The plugin is designed for flight simulation and air traffic control using VATSIM. Understanding of aviation radio procedures and TrackAudio functionality may be helpful when making changes.

## Working Effectively

### Bootstrap and Build
- **Install dependencies**: `npm ci` -- takes ~3 seconds on fast machines, up to 15 seconds on slower ones. NEVER CANCEL. Set timeout to 30+ seconds.
- **Build the plugin**: `npm run build` -- takes ~10 seconds consistently. NEVER CANCEL. Set timeout to 30+ seconds.
- **Lint the code**: `npm run lint` -- takes ~4 seconds consistently. Set timeout to 15+ seconds.

### Development Workflow
- **For active development**: `npm run watch` -- builds automatically on file changes. NEVER CANCEL during initial build.
  - This builds successfully (~10 seconds initially) but the Stream Deck restart will fail without Stream Deck software installed (expected).
  - After initial build, it watches for changes and rebuilds incrementally.
  - The command stays running and shows "waiting for changes..." when ready.
- **Link plugin to Stream Deck**: `npm run link` -- ONLY works if Stream Deck software is installed.
- **Package plugin**: `npm run pack` -- FAILS due to URL validation (projects.neilenns.com is not resolvable). This is a known limitation.

### Required Dependencies
- Node.js 20.x (exact version used in CI: 20.19.4)
- Stream Deck software (required for `npm run link` and full `npm run watch` functionality)
- TrackAudio application (required for websocket connection during runtime testing)

## Validation

### Always Run These Commands After Making Changes
1. `npm run build` -- NEVER CANCEL. Set timeout to 30+ seconds.
2. `npm run lint` -- NEVER CANCEL. Set timeout to 15+ seconds.

### Manual Testing Limitations
- **Cannot test actual plugin functionality** without both Stream Deck software AND TrackAudio installed.
- **Can only validate**: builds succeed, linting passes, TypeScript compiles correctly.
- **Cannot validate**: websocket connections, Stream Deck actions, button interactions, image rendering.

### Expected Command Behaviors
- `npm ci` ✅ Works (installs dependencies)
- `npm run build` ✅ Works (builds plugin to com.neil-enns.trackaudio.sdPlugin/bin/)
- `npm run lint` ✅ Works (ESLint + Markdownlint)
- `npm run watch` ✅ Builds but Stream Deck restart fails (expected without software)
- `npm run link` ❌ Fails without Stream Deck software (expected)
- `npm run pack` ❌ Fails due to URL validation (known issue)
- `npm test` ❌ No test suite exists

### No Automated Tests
This repository has NO test scripts. Do not attempt to run `npm test` or create tests unless specifically requested.

## Code Architecture

### Key Directories
- `src/actions/`: Stream Deck action classes (stationStatus.ts, pushToTalk.ts, etc.)
- `src/controllers/`: Individual action instance managers extending BaseController
- `src/events/`: Event handler functions for Stream Deck and TrackAudio events
- `src/managers/`: Singleton classes for global state (ActionManager, TrackAudioManager, etc.)
- `src/interfaces/`: TypeScript types and interfaces
- `src/utils/`: Utility functions and constants
- `com.neil-enns.trackaudio.sdPlugin/`: Plugin manifest, images, property inspectors

### Critical Files
- `src/plugin.ts`: Main entry point, registers actions and event handlers
- `src/managers/trackAudio.ts`: Websocket connection to TrackAudio (localhost:49080)
- `src/managers/action.ts`: Tracks all plugin actions on Stream Deck profiles
- `com.neil-enns.trackaudio.sdPlugin/manifest.json`: Plugin configuration and metadata
- `rollup.config.mjs`: Build configuration
- `tsconfig.json`: TypeScript configuration with path aliases

### Build Output
- Built plugin: `com.neil-enns.trackaudio.sdPlugin/bin/plugin.js`
- Build artifacts are automatically created by Rollup

## Common Development Tasks

### Making Code Changes
1. Edit source files in `src/`
2. Run `npm run build` (10 seconds, set 30+ second timeout)
3. Run `npm run lint` (4 seconds, set 15+ second timeout)
4. For debugging: Use VSCode F5 with included launch configuration

### TypeScript Path Aliases
The project uses these aliases (defined in tsconfig.json):
- `@actions/*` → `./src/actions/*`
- `@controllers/*` → `./src/controllers/*`
- `@events/*` → `./src/events/*`
- `@managers/*` → `./src/managers/*`
- `@interfaces/*` → `./src/interfaces/*`
- `@utils/*` → `./src/utils/*`

### VSCode Integration
- F5 debugging available (requires `npm run watch` to be running)
- Suggested extensions configured in `.vscode/extensions.json`
- Build task configured for watch mode

## Common Issues and Limitations

### Known Failing Commands
- `npm run pack`: Fails with "URL must be resolvable" error due to projects.neilenns.com being unreachable
- `npm run link`: Requires Stream Deck software installation
- Stream Deck restart in watch mode: Requires Stream Deck software

### Documentation Issues
- DEVELOPMENT.md incorrectly refers to `npm run package` -- the actual command is `npm run pack`
- Some URLs in manifest.json are not resolvable which causes pack validation to fail

### Development Without Stream Deck Software
- You CAN: Build, lint, edit code, examine architecture
- You CANNOT: Test plugin functionality, link to Stream Deck, restart plugin

### External Dependencies
- **TrackAudio**: Aviation radio application that plugin connects to via websocket
- **Stream Deck Software**: Required for plugin installation and testing
- **VATSIM**: Plugin fetches ATIS data from VATSIM (optional functionality)

## File Structure Reference

```
├── .github/workflows/         # CI/CD (Windows build environment)
├── .vscode/                  # VSCode debugging configuration
├── com.neil-enns.trackaudio.sdPlugin/  # Plugin assets and manifest
│   ├── bin/                  # Build output (plugin.js)
│   ├── images/               # Plugin icons and button images
│   ├── pi/                   # Property inspector HTML pages
│   └── manifest.json         # Plugin metadata
├── src/                      # TypeScript source code
│   ├── actions/              # Stream Deck action implementations
│   ├── controllers/          # Action instance management
│   ├── events/               # Event handlers
│   ├── managers/             # Global state management
│   ├── interfaces/           # TypeScript definitions
│   ├── utils/                # Utility functions
│   └── plugin.ts             # Main entry point
├── package.json              # Dependencies and scripts
├── rollup.config.mjs         # Build configuration
└── tsconfig.json             # TypeScript configuration
```

## CI/CD Information

The project uses GitHub Actions with:
- **Build environment**: Windows (matches Stream Deck target)
- **Node.js version**: 20.19.4
- **Commands**: `npm ci`, `npm run build`, `npm run lint`, custom pack action
- **Artifact**: `com.neil-enns.trackaudio.streamDeckPlugin` (packaged plugin)

Always ensure your changes pass `npm run build` and `npm run lint` before committing.