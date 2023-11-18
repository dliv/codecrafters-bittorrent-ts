// serialization issues when round tripping bytes to "chars" to bytes
// keep the original bytes for the string
// TODO: could maybe get away with a WeakRef here
export const hackStrToBytes = new Map();
