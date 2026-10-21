// The app is published as a static site on Spacefast, so every route is prerendered at build
// time. Anything user-specific (the GitHub token, and the data it unlocks) is loaded in the
// browser, which is why the gists page carries no server load function.
export const prerender = true;
