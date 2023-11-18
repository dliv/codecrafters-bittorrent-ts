import { asByte } from '../decode';
import { hackStrToBytes } from '../hack';

export function encodeDict(dict) {
  const keys = Object.keys(dict).sort();
  const bytes: (number | number[])[] = [asByte('d')];
  for (const key of keys) {
    const keyStr = `${key.length}:${key}`;
    bytes.push(Array.from(Buffer.from(keyStr, 'utf8')));
    const val = dict[key];
    if (typeof val === 'number') {
      const intStr = `i${val}e`;
      bytes.push(Array.from(Buffer.from(intStr, 'utf8')));
    } else if (typeof val === 'string') {
      const strBytes = hackStrToBytes.get(val);
      if (!strBytes) {
        throw new Error(`no bytes for ${val}`);
      }
      const prefix = `${strBytes.length}:`;
      bytes.push(Array.from(Buffer.from(prefix, 'utf8')));
      bytes.push(strBytes);
    } else {
      throw new Error(`unsupported val type for ${val}`);
    }
  }
  bytes.push(asByte('e'));
  return Buffer.from(bytes.flat());
}
