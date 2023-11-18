import assert from 'node:assert';
import net from 'node:net';

import { getInfo } from '../info';

export async function handshakeCommand(
  file: string,
  peer: string,
): Promise<string> {
  const resp = await doHandshake(file, peer);
  return `Peer ID: ${resp.toString('hex')}`;
}

export async function doHandshake(file: string, peer: string): Promise<Buffer> {
  const info = getInfo(file);
  const handshake = getHandshake(info);
  const handshakeResp = await getHandshakeResponse(peer, handshake);
  return handshakeResp;
}

function getHandshake(info): Buffer {
  const length = Buffer.from([19]);
  assert(length.length === 1, 'length.length !== 1');

  const protocol = Buffer.from('BitTorrent protocol');
  assert(protocol.length === 19, 'protocol.length !== 19');

  const reserved = Buffer.from([0, 0, 0, 0, 0, 0, 0, 0]);
  assert(reserved.length === 8, 'reserved.length !== 8');

  const infoHash = Buffer.from(info.sha1, 'hex');
  assert(infoHash.length === 20, 'infoHash.length !== 20');

  const peerId = Buffer.from('00112233445566778899');
  assert(peerId.length === 20, 'peerId.length !== 20');

  const handshake = Buffer.concat([
    length,
    protocol,
    reserved,
    infoHash,
    peerId,
  ]);

  console.error(
    `sent handshake.length ${handshake.length}, as hex:\t\n${handshake.toString(
      'hex',
    )}`,
  );

  return handshake;
}

async function getHandshakeResponse(
  peer: string,
  handshake: Buffer,
): Promise<Buffer> {
  const [host, portStr] = peer.split(':');
  const port = Number.parseInt(portStr, 10);
  if (!(Number.isSafeInteger(port) && port > 0)) {
    throw new Error(`bad port: ${portStr}`);
  }
  return new Promise((resolve, reject) => {
    const client = new net.Socket();

    client.connect(port, host, () => {
      console.error('TCP connection established');
      client.write(handshake);
    });

    client.on('data', (data) => {
      console.error('Received:', data);
      // hopefully the whole msg fits in one data
      resolve(data);
      console.error(
        `got handshake.length ${data.length}, as hex:\t\n${data.toString(
          'hex',
        )}`,
      );
      client.end();
    });

    client.on('close', () => {
      console.error('Connection closed');
      reject(new Error(`closed before promise fulfilled`));
    });

    client.on('error', (err) => {
      console.error('Error:', err);
      reject(err);
    });
  });
}
