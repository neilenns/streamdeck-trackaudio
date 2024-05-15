# Developing with this repo

## Building

1. Run `npm install`
2. Run `npm run build`

The first time you do this on any machine you also need to do `npm run link` otherwise the compiled plugin won't be available to the Stream Deck.

For active development use `npm run watch` instead of `npm run build`, this will auto-refresh the plugin when files change.

## Packaging

Run `npm run package`. Make sure `npm run build` was done first.

## Debugging

VSCode can debug using the `Attach to Plugin` profile. Select the appropriate node.js instance. Yes, there should be a better, more automatic,
way to do this. I'll figure it out someday.
