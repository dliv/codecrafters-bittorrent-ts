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
