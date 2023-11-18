import http from 'node:http';

import { getInfo } from '../info/info';
import { decodeBencode } from '../decode';
import { hackStrToBytes } from '../hack';

const peerId = 'a79a7e603a3d4357b52f';
const PORT = '6881';

export async function peersCommand(file: string) {
  const peersResp = await peers(file);
  return peersResp.peers.join('\n');
}

export async function peers(file: string) {
  const info = getInfo(file);
  const url = getPeersUrl(info);
  const respStr = await httpGetBuffer(url);
  const decoded = decodePeersResp(respStr);
  return decoded;
}

// exported for testing
export function decodePeersResp(resp: Buffer) {
  const { interval, peers } = JSON.parse(String(decodeBencode(resp)));
  const peersBytes = hackStrToBytes.get(peers);
  const peerStrs: string[] = [];
  for (let i = 0; i < peersBytes.length; i += 6) {
    const ip = peersBytes.slice(i, i + 4).join('.');
    const [p0, p1] = peersBytes.slice(i + 4, i + 6);
    const port = (p0 << 8) | p1;
    const str = [ip, port].join(':');
    peerStrs.push(str);
  }
  return { interval, peers: peerStrs };
}

function getPeersUrl(info): string {
  const infoHashBuf = Buffer.from(info.sha1, 'hex');
  if (infoHashBuf.length !== 20) {
    throw new Error('infoHashRaw.length !== 20');
  }

  const params = new URLSearchParams();
  params.append('peer_id', peerId);
  params.append('port', PORT);
  params.append('uploaded', '0');
  params.append('downloaded', '0');
  params.append('left', info.info.length.toString());
  params.append('compact', '1');

  let url = `${info.announce}?${params.toString()}`;
  url += `&info_hash=${encodeInfoHash(info.sha1)}`;
  return url;
}

// exported for testing
export function encodeInfoHash(hexStr: string): string {
  const encoded: string[] = [];
  for (let i = 0; i < hexStr.length; i += 2) {
    const pair = hexStr.slice(i, i + 2);
    let e = '';
    switch (pair.toLowerCase()) {
      case '4c':
        e = 'L';
        break;
      case '54':
        e = 'T';
        break;
      case '68':
        e = 'h';
        break;
      case '71':
        e = 'q';
        break;
      default:
        e = `%${pair}`;
    }
    encoded.push(e);
  }
  return encoded.join('');
}

function httpGetBuffer(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    http
      .get(url, (res) => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(new Error('StatusCode=' + res.statusCode));
        }

        const chunks = [];

        // Collect chunks of data
        res.on('data', (chunk) => {
          chunks.push(chunk);
        });

        // The whole response has been received. Combine the chunks and resolve.
        res.on('end', () => {
          const buffer = Buffer.concat(chunks);
          resolve(buffer);
        });
      })
      .on('error', (err) => {
        reject(err);
      });
  });
}
