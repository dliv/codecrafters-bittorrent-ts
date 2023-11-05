const process = require("process");

class Token {
  constructor(str) {
    this.str = str;
  }

  toString() {
    return this.str;
  }
}

class IntToken extends Token {
  static fromInt(i) {
    return new IntToken(i.toString());
  }
}

class StrToken extends Token {
  toString() {
    return `"${this.str}"`;
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
    // (this.tokens.at(-2) instanceof KvSeparatorToken ||
    //   this.tokens.at(-2) instanceof OpenDictToken);

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

    let nextTokens =
      needsArrSep || needsDictSep
        ? this.tokens.concat(new SeparatorToken())
        : needsKvSep
        ? this.tokens.concat(new KvSeparatorToken())
        : this.tokens;
    console.error(
      `>>> incoming: ${t}\n\ttokens: ${this.tokens.join(
        " "
      )}\n\tdelims: ${this.openDelims.join(" ")}\n\tstate: ${JSON.stringify({
        needsArrSep,
        needsKvSep,
        needsDictSep,
      })}`
    );
    return new TokenStream(nextTokens.concat(t), nextDelims);
  }

  toString() {
    return this.tokens.join("");
  }
}

// Examples:
// - decodeBencode("5:hello") -> "hello"
// - decodeBencode("10:hello12345") -> "hello12345"
// - l5:helloi52ee -> ["hello", 52]
function decodeBencode(bencodedValue, idx = 0, tokens = new TokenStream()) {
  if (idx > bencodedValue.length) {
    throw new Error("out of bounds");
  }
  if (idx === bencodedValue.length) {
    return tokens;
  }
  if (bencodedValue[idx] === "d") {
    return decodeBencode(
      bencodedValue,
      idx + 1,
      tokens.add(new OpenDictToken())
    );
  }
  if (bencodedValue[idx] === "l") {
    return decodeBencode(
      bencodedValue,
      idx + 1,
      tokens.add(new OpenArrayToken())
    );
  }
  if (bencodedValue[idx] === "e") {
    return decodeBencode(bencodedValue, idx + 1, tokens.end());
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
    let str = "";
    let ate = 0;
    while (ate++ < sizeNum) {
      str += bencodedValue[next++];
    }
    // if (next < bencodedValue.length) {
    //   throw new Error("did not consume entire str");
    // }
    return decodeBencode(bencodedValue, next, tokens.add(new StrToken(str)));
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
    return decodeBencode(
      bencodedValue,
      next,
      tokens.add(IntToken.fromInt(parsed))
    );
  }
  throw new Error("Unknown token type");
}

function main() {
  const command = process.argv[2];

  if (command === "decode") {
    const bencodedValue = process.argv[3];
    console.log(String(decodeBencode(bencodedValue)));
  } else {
    throw new Error(`Unknown command ${command}`);
  }
}

main();
