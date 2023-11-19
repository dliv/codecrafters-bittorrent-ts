import assert from 'node:assert';
import crypto from 'node:crypto';
import fs from 'node:fs';

import { decodeBencode } from '../decode';
import { hackStrToBytes } from '../hack';
import { encodeDict } from './encode-dict';

export type DecodedTorrentFile = {
  announce: string;
  info: {
    length: number;
    'piece length': number;
    pieces: string;
  };
};

export type TorrentInfo = DecodedTorrentFile & {
  pieceHashes: string[];
  sha1: string;
  sha1Raw: Buffer;
};

export const getInfo = (file: string): TorrentInfo => {
  const contents = fs.readFileSync(file);
  const decoded = decodeBencode(contents);
  const parsed: DecodedTorrentFile = JSON.parse(decoded);
  const { announce, info } = parsed;
  assert(typeof announce === 'string', 'announce is not a string');
  assert(typeof info === 'object', 'info is not an object');
  assert(typeof info.length === 'number', 'info.length is not a number');
  assert(typeof info['piece length'] === 'number', 'info["piece length"] is not a number');

  // this should actually be a Buffer or number[] but my original decoder loses some info
  // (i.e. is shit) so we need `hackStrToBytes` to look up the original bytes
  assert(typeof info.pieces === 'string', 'info.pieces is not a string');

  const encodedInfo = encodeDict(info);
  const hasher = crypto.createHash('sha1');
  hasher.update(encodedInfo);
  const sha1 = hasher.digest('hex');
  const hasherRaw = crypto.createHash('sha1');
  hasherRaw.update(encodedInfo);
  const sha1Raw = hasherRaw.digest();

  const piecesConcat = hackStrToBytes.get(info.pieces);
  const pieceHashes: string[] = [];
  for (let i = 0; i < piecesConcat.length; i += 20) {
    const p = piecesConcat.slice(i, i + 20);
    pieceHashes.push(Buffer.from(p).toString('hex'));
  }

  const extendedInfo: TorrentInfo = {
    announce,
    info,
    sha1,
    sha1Raw,
    pieceHashes,
  };

  return extendedInfo;
};

export function infoCommand(file: string) {
  const { announce, info, sha1, pieceHashes } = getInfo(file);
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
