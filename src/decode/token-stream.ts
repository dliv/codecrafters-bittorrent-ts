import {
  CloseArrayToken,
  CloseDictToken,
  KvSeparatorToken,
  OpenArrayToken,
  OpenDictToken,
  SeparatorToken,
  StrToken,
  Token,
} from './tokens';

export class TokenStream {
  constructor(
    readonly tokens: Token[] = [],
    readonly openDelims: Token[] = [],
  ) {
    this.openDelims = openDelims ?? [];
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
    throw new Error('unexpected end');
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
        throw new Error('unmatched close array token');
      }
      nextDelims = [...nextDelims];
      nextDelims.pop();
    } else if (t instanceof CloseDictToken) {
      const top = nextDelims.at(-1);
      if (!(top instanceof OpenDictToken)) {
        throw new Error('unmatched close dict token');
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
      throw new Error('cannot need both');
    }
    if (needsKvSep && (needsDictSep || needsArrSep)) {
      throw new Error('cannot need kv and dict/arr sep');
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
    const raw = this.tokens.join('');
    const parsed = JSON.parse(raw);
    const str = JSON.stringify(parsed);
    return str;
  }
}
