// my original decoder assumed we wouldn't need the original bytes again
// but we do and i'm too lazy to touch the decoder again
// so this hack allows looking up the original bytes
// (could maybe use a WeakRef but really the decoder should just be rewritten)
export const hackStrToBytes = new Map<string, number[]>();
