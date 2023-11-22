import assert from 'assert';

import { TorrentInfo } from '../info';

export function getBlocksForTorrentPiece(torrent: TorrentInfo, pieceNum: number): number[] {
  const pieceLen = getPieceLength(torrent, pieceNum);

  const blocks = getBlocks(pieceLen);
  let total = 0;
  for (const b of blocks) {
    total += b;
  }
  assert(
    total === pieceLen,
    `total ${total} !== pieceLen ${torrent.info.length}, pieceNum: ${pieceNum}, info['piece length']: ${torrent.info['piece length']}]`,
  );
  return blocks;
}

export function getPieceLength(torrent: TorrentInfo, pieceNum: number): number {
  assert(
    pieceNum < torrent.pieceHashes.length,
    `index out of bounds: pieceNum ${pieceNum}, torrent.pieceHashes.length ${torrent.pieceHashes.length}`,
  );
  const isLast = pieceNum === torrent.pieceHashes.length - 1;
  const pieceLen = isLast ? torrent.info.length % torrent.info['piece length'] : torrent.info['piece length'];
  return pieceLen;
}

function getBlocks(remainingSize: number, blockSize = 16 * 1024, accum?: number[]): number[] {
  const nextBlock = remainingSize > blockSize ? blockSize : remainingSize;
  assert(nextBlock <= remainingSize, `nextBlock ${nextBlock} > remainingSize ${remainingSize}`);
  return nextBlock === remainingSize
    ? [...(accum ?? []), nextBlock]
    : getBlocks(remainingSize - nextBlock, blockSize, [...(accum ?? []), nextBlock]);
}

export function minutes(m: number) {
  return seconds(m * 60);
}

export function seconds(s: number) {
  return s * 1_000;
}
