const crypto = require('node:crypto');
const fs = require('node:fs');

import { decodeBencode } from '../decode';
import { hackStrToBytes } from '../hack';
import { encodeDict } from './encode-dict';

export function info(file: string) {
  const contents = fs.readFileSync(file);
  const decoded = decodeBencode(contents);
  const parsed = JSON.parse(decoded);
  const { announce, info } = parsed;
  const encodedInfo = encodeDict(info);
  const hasher = crypto.createHash('sha1');
  hasher.update(encodedInfo);
  const sha1 = hasher.digest('hex');

  const piecesConcat = hackStrToBytes.get(info.pieces);
  const pieceHashes: string[] = [];
  for (let i = 0; i < piecesConcat.length; i += 20) {
    const p = piecesConcat.slice(i, i + 20);
    pieceHashes.push(Buffer.from(p).toString('hex'));
  }

  const infoStr = [
    ['Tracker URL', announce],
    ['Length', info.length],
    ['Info Hash', sha1],
    ['Piece Length', info['piece length']],
    ['Piece Hashes', pieceHashes.join('\n'), '\n'],
  ]
    .map(([k, v, delim = ' ']) => `${k}:${delim}${v}`)
    .join('\n');
  return infoStr;
}
