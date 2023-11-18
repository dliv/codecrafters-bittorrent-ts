import { hackStrToBytes } from '../hack';

export class Token {
  constructor(readonly str?: string) {}

  toString() {
    return this.str;
  }
}

export class IntToken extends Token {}

export class StrToken extends Token {
  readonly buffer: Buffer;
  constructor(strBytes) {
    const buffer = Buffer.from(strBytes);
    const str = buffer.toString('utf8');
    hackStrToBytes.set(str, strBytes);
    super(str);
    this.buffer = buffer;
  }
  toString() {
    return JSON.stringify(this.str);
  }
}

export class OpenArrayToken extends Token {
  toString() {
    return `[`;
  }
}

export class CloseArrayToken extends Token {
  toString() {
    return `]`;
  }
}

export class OpenDictToken extends Token {
  toString() {
    return `{`;
  }
}

export class CloseDictToken extends Token {
  toString() {
    return `}`;
  }
}

export class SeparatorToken extends Token {
  toString() {
    return `, `;
  }
}

export class KvSeparatorToken extends Token {
  toString() {
    return `: `;
  }
}
