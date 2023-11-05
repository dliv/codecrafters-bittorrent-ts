const fs = require("fs");
const process = require("process");

// TODO: dict keys need to be sorted

class Token {
  constructor(str) {
    this.str = str;
  }

  toString() {
    return this.str;
  }
}

class IntToken extends Token {}

class StrToken extends Token {
  constructor(strBytes) {
    const buffer = Buffer.from(strBytes);
    super(buffer.toString("utf8"));
    this.buffer = buffer;
  }
  toString() {
    return JSON.stringify(this.str);
  }
}

class OpenArrayToken extends Token {
  toString() {
    return `[`;
  }
}

class CloseArrayToken extends Token {
  toString() {
    return `]`;
  }
}

class OpenDictToken extends Token {
  toString() {
    return `{`;
  }
}

class CloseDictToken extends Token {
  toString() {
    return `}`;
  }
}

class SeparatorToken extends Token {
  toString() {
    return `, `;
  }
}

class KvSeparatorToken extends Token {
  toString() {
    return `: `;
  }
}

class TokenStream {
  constructor(tokens, delims) {
    this.openDelims = delims ?? [];
    this.tokens = tokens ?? [];
  }

  end() {
    const top = this.openDelims.at(-1);
    if (top instanceof OpenArrayToken) {
      return this.add(new CloseArrayToken());
    }
    if (top instanceof OpenDictToken) {
      return this.add(new CloseDictToken());
    }
    throw new Error("unexpected end");
  }

  bailStr() {
    if (!this.openDelims.length) {
      return this.toString();
    }
    return this.end().bailStr();
  }

  add(t) {
    let nextDelims = this.openDelims;
    if (t instanceof OpenArrayToken) {
      nextDelims = nextDelims.concat(t);
    } else if (t instanceof OpenDictToken) {
      nextDelims = nextDelims.concat(t);
    } else if (t instanceof CloseArrayToken) {
      const top = nextDelims.at(-1);
      if (!(top instanceof OpenArrayToken)) {
        throw new Error("unmatched close array token");
      }
      nextDelims = [...nextDelims];
      nextDelims.pop();
    } else if (t instanceof CloseDictToken) {
      const top = nextDelims.at(-1);
      if (!(top instanceof OpenDictToken)) {
        throw new Error("unmatched close dict token");
      }
      nextDelims = [...nextDelims];
      nextDelims.pop();
    }

    const needsArrSep =
      this.openDelims.at(-1) instanceof OpenArrayToken &&
      !(t instanceof CloseArrayToken) &&
      !(this.tokens.at(-1) instanceof OpenArrayToken);

    const needsKvSep =
      this.openDelims.at(-1) instanceof OpenDictToken &&
      this.tokens.at(-1) instanceof StrToken &&
      !(this.tokens.at(-2) instanceof KvSeparatorToken);

    const needsDictSep =
      !needsKvSep &&
      this.openDelims.at(-1) instanceof OpenDictToken &&
      !(t instanceof CloseDictToken) &&
      !(this.tokens.at(-1) instanceof OpenDictToken);

    if (needsArrSep && needsDictSep) {
      throw new Error("cannot need both");
    }
    if (needsKvSep && (needsDictSep || needsArrSep)) {
      throw new Error("cannot need kv and dict/arr sep");
    }

    const nextTokens =
      needsArrSep || needsDictSep
        ? this.tokens.concat(new SeparatorToken())
        : needsKvSep
        ? this.tokens.concat(new KvSeparatorToken())
        : this.tokens;

    return new TokenStream(nextTokens.concat(t), nextDelims);
  }

  toString() {
    return this.tokens.join("");
  }
}

const asByte = (ch) => ch.charCodeAt(0);

const I = asByte("i");
const E = asByte("e");
const COLON = asByte(":");
const HYPHEN = asByte("-");
const $0 = asByte("0");
const $9 = asByte("9");
const L = asByte("l");
const D = asByte("d");

const intFromByte = (b) => Number.parseInt(String.fromCharCode(b), 10);

// Examples:
// - decodeBencode("5:hello") -> "hello"
// - decodeBencode("10:hello12345") -> "hello12345"
// - l5:helloi52ee -> ["hello", 52]
function decodeBencode(bytes, idx = 0, tokens = new TokenStream()) {
  if (idx > bytes.length) {
    console.error(`>>> ERROR: idx ${idx} > ${bytes.length}`);
    return tokens.bailStr(); // lol - not handling bytes correctly in some sample files?
  }
  if (idx === bytes.length) {
    return tokens;
  }
  if (bytes[idx] === D) {
    return decodeBencode(bytes, idx + 1, tokens.add(new OpenDictToken()));
  }
  if (bytes[idx] === L) {
    return decodeBencode(bytes, idx + 1, tokens.add(new OpenArrayToken()));
  }
  if (bytes[idx] === E) {
    return decodeBencode(bytes, idx + 1, tokens.end());
  }
  if (!isNaN(intFromByte(bytes[idx]))) {
    let next = idx;
    const sizeBytes = [bytes[idx]];
    while (!isNaN(intFromByte(bytes[++next]))) {
      sizeBytes.push(bytes[next]);
    }
    if (!bytes[next] === COLON) {
      throw new Error("expected :");
    }
    ++next;
    const sizeStr = Buffer.from(sizeBytes).toString("utf8");
    const sizeNum = Number.parseInt(sizeStr, 10);
    const strBytes = [];
    let ate = 0;
    while (ate++ < sizeNum) {
      strBytes.push(bytes[next++]);
    }
    return decodeBencode(bytes, next, tokens.add(new StrToken(strBytes)));
  }
  if (bytes[idx] === I) {
    let next = idx + 1;
    const numBytes = [];
    if (bytes[next] === HYPHEN) {
      numBytes.push(bytes[next++]);
    }
    while (bytes[next] !== E && next < bytes.length) {
      const numB = bytes[next++];
      if (numB < $0 || numB > $9) {
        throw new Error(`invalid integer byte ${numB}`);
      }
      numBytes.push(numB);
    }
    const numStr = Buffer.from(numBytes).toString("utf8");
    ++next;
    return decodeBencode(bytes, next, tokens.add(new IntToken(numStr)));
  }
  throw new Error("Unknown token type");
}

function info(file) {
  const contents = fs.readFileSync(file);
  console.error(`>>> contents:\n${contents}`);
  const decoded = decodeBencode(contents);
  console.error(`>>> decoded:\n${decoded}`);
  const parsed = JSON.parse(decoded);
  console.error(`>>> parsed:\n${JSON.stringify(parsed, null, 2)}`);
  const infoStr = [
    ["Tracker URL", parsed.announce],
    ["Length", parsed.info.length],
  ]
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
  return infoStr;
}

function main() {
  const command = process.argv[2];

  switch (command) {
    case "decode": {
      const bencodedValue = process.argv[3];
      const bytes = Buffer.from(bencodedValue, "utf8");
      console.log(String(decodeBencode(bytes)));
      break;
    }
    case "info": {
      const file = process.argv[3];
      console.log(info(file));
      break;
    }
    default:
      throw new Error("Not implemented");
  }
}

main();
