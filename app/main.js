const process = require("process");
const util = require("util");

// Examples:
// - decodeBencode("5:hello") -> "hello"
// - decodeBencode("10:hello12345") -> "hello12345"
function decodeBencode(bencodedValue, idx = 0, accum = []) {
  if (idx > bencodedValue.length) {
    throw new Error("out of bounds");
  }
  if (idx === bencodedValue.length) {
    return accum.join("");
  }
  // Check if the first character is a digit
  if (!isNaN(bencodedValue[idx])) {
    let next = idx;
    let size = bencodedValue[idx];
    while (!isNaN(bencodedValue[++next])) {
      size += bencodedValue[next];
    }
    if (!bencodedValue[next] === ":") {
      throw new Error("expected :");
    }
    ++next;
    const sizeNum = Number.parseInt(size);
    console.error("sizeNum", sizeNum);
    let str = '"';
    let ate = 0;
    while (ate++ < sizeNum) {
      str += bencodedValue[next++];
    }
    if (next < bencodedValue.length) {
      throw new Error("did not consume entire str");
    }
    str += '"';
    return decodeBencode(bencodedValue, next, accum.concat(str));
  }
  if (bencodedValue[idx] === "i") {
    let next = idx + 1;
    let num = "";
    while (bencodedValue[next] !== "e" && next < bencodedValue.length) {
      num += bencodedValue[next++];
    }
    let parsed = Number.parseInt(num, 10);
    if (!Number.isSafeInteger(parsed)) {
      throw new Error("invalid integer");
    }
    const str = String(parsed);
    ++next;
    return decodeBencode(bencodedValue, next, accum.concat(str));
  }
  throw new Error("Only strings are supported at the moment");
}

function main() {
  const command = process.argv[2];

  if (command === "decode") {
    const bencodedValue = process.argv[3];
    console.log(decodeBencode(bencodedValue));
  } else {
    throw new Error(`Unknown command ${command}`);
  }
}

main();
