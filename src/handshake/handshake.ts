import { getInfo } from '../info';
import { PeerConnection } from '../peers';

export async function handshakeCommand(file: string, peer: string): Promise<string> {
  const conn = new PeerConnection(getInfo(file), peer);
  const { peerIdHex } = await conn.handshake();
  await conn.close();
  return `Peer ID: ${peerIdHex}`;
}
