import assert from 'node:assert';

import { TorrentInfo } from '../info';

export type Handshake = {
  peerId: Buffer;
  peerIdHex: string;
  handshakeResp: Buffer;
};

export function parseHandshake(data: Buffer): Handshake {
  // should validate the info hash
  const peerId = data.subarray(data.length - 20);
  return {
    peerId,
    peerIdHex: peerId.toString('hex'),
    handshakeResp: data,
  };
}

export function getHandshake(info: TorrentInfo): Buffer {
  const prefix = getHandshakePrefix();

  // seems like this should be part of the prefix
  // but the return handshake has a non-zero for one of these
  const reserved = Buffer.from([0, 0, 0, 0, 0, 0, 0, 0]);
  assert(reserved.length === 8, 'reserved.length !== 8');

  const infoHash = Buffer.from(info.sha1, 'hex');
  assert(infoHash.length === 20, 'infoHash.length !== 20');

  const peerId = Buffer.from('00112233445566778899');
  assert(peerId.length === 20, 'peerId.length !== 20');

  const handshake = Buffer.concat([prefix, reserved, infoHash, peerId]);

  return handshake;
}

function getHandshakePrefix(): Buffer {
  const length = Buffer.from([19]);
  assert(length.length === 1, 'length.length !== 1');

  const protocol = Buffer.from('BitTorrent protocol');
  assert(protocol.length === 19, 'protocol.length !== 19');

  const prefix = Buffer.concat([length, protocol]);

  return prefix;
}

export function isHandshake(data: Buffer): boolean {
  if (data.length < 68) {
    return false;
  }
  const prefix = getHandshakePrefix();
  for (let i = 0; i < prefix.length; i++) {
    if (data[i] !== prefix[i]) {
      return false;
    }
  }
  return true;
}
