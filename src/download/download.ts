import assert from 'node:assert';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';

import { getInfo } from '../info';
import { peers, PeerConnection } from '../peers';
import { sample } from './util';

export async function downloadPieceCommand(saveFile: string, torrentFile: string, pieceNum: number): Promise<string> {
  await downloadPiece(saveFile, torrentFile, pieceNum);
  return `Piece ${pieceNum} downloaded to ${saveFile}.`;
}

export async function downloadPiece(saveFile: string, torrentFile: string, pieceNum: number): Promise<void> {
  const info = getInfo(torrentFile);
  const peersResp = await peers(torrentFile);

  const peer = sample(peersResp.peers);
  const conn = new PeerConnection(info, peer);

  try {
    const piece = await conn.downloadSinglePiece(pieceNum);

    // const piece = await Promise.race(
    //   peersResp.peers.map(async (peer) => {
    //     const conn = new PeerConnection(info, peer);
    //     const piece = await conn.downloadSinglePiece(pieceNum);
    //     return piece;
    //   }),
    // );

    // ideally we could stream the piece into the file but that's more involved
    // since we validate the sha1. this should be fine since we're only writing a piece at a time
    await fs.writeFile(saveFile, piece);
    console.error(`saved piece ${pieceNum} to ${saveFile}`);
  } finally {
    conn.close();
  }
}

export async function downloadCommand(saveFile: string, torrentFile: string): Promise<string> {
  await download(saveFile, torrentFile);
  return `Downloaded ${torrentFile} to ${saveFile}.`;
}

export async function download(saveFile: string, torrentFile: string): Promise<void> {
  const info = getInfo(torrentFile);
  const peersResp = await peers(torrentFile);

  // for a real torrent :
  // - the entire buffer may not fit in memory
  // - parallel

  const pieces: Buffer[] = [];
  for (let i = 0; i < info.pieceHashes.length; i++) {
    for (let j = 0; j < 3; ++j) {
      if (pieces[i]) {
        continue;
      }
      const peer = sample(peersResp.peers);
      const conn = new PeerConnection(info, peer);
      try {
        const piece = await conn.downloadSinglePiece(i);
        pieces[i] = piece;
      } catch (e) {
        console.error(`Error (try:${j}) on piece ${i}: ${(e as Error).message}`);
      } finally {
        conn.close();
      }
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  for (let i = 0; i < info.pieceHashes.length; i++) {
    assert(pieces[i], `missing piece ${i}`);
  }

  const fileBuffer = Buffer.concat(pieces);

  // validate post conditions
  {
    assert(
      fileBuffer.length === info.info.length,
      `wrong length: fileBuffer ${fileBuffer.length} !== info ${info.info.length}`,
    );
  }

  await fs.writeFile(saveFile, fileBuffer);
  console.error(`saved ${torrentFile} to ${saveFile}`);
}
