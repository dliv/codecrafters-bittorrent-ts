import { TokenStream } from './token-stream';
import { OpenDictToken, OpenArrayToken, StrToken, IntToken } from './tokens';
import { D, L, E, COLON, I, HYPHEN, $0, $9 } from './utils';

const intFromByte = (b) => Number.parseInt(String.fromCharCode(b), 10);

// Examples:
// - decodeBencode("5:hello") -> "hello"
// - decodeBencode("10:hello12345") -> "hello12345"
// - l5:helloi52ee -> ["hello", 52]
export function decodeBencode(bytes, idx = 0, tokens = new TokenStream()) {
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
    // // ????
    // if (!bytes[next] === COLON) {
    //   throw new Error('expected :');
    // }
    if (bytes[next] !== COLON) {
      throw new Error('expected :');
    }
    ++next;
    const sizeStr = Buffer.from(sizeBytes).toString('utf8');
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
    const numStr = Buffer.from(numBytes).toString('utf8');
    ++next;
    return decodeBencode(bytes, next, tokens.add(new IntToken(numStr)));
  }
  throw new Error('Unknown token type');
}
