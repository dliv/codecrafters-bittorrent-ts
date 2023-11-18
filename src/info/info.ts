const crypto = require('node:crypto');
const fs = require('node:fs');

import { decodeBencode } from '../decode';
import { encodeDict } from './encode-dict';

export function info(file: string) {
  const contents = fs.readFileSync(file);
  console.error(`>>> contents:\n${contents}`);
  const decoded = decodeBencode(contents);
  console.error(`>>> decoded:\n${decoded}`);
  const parsed = JSON.parse(decoded);
  console.error(`>>> parsed:\n${JSON.stringify(parsed, null, 2)}`);
  const { announce, info } = parsed;
  const encodedInfo = encodeDict(info);
  console.error(`>>> encoded info:\n${encodedInfo}`);
  console.error(`>>> round-trip info:\n${decodeBencode(encodedInfo)}`);
  const hasher = crypto.createHash('sha1');
  hasher.update(encodedInfo);
  const sha1 = hasher.digest('hex');
  const infoStr = [
    ['Tracker URL', announce],
    ['Length', info.length],
    ['Info Hash', sha1],
  ]
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');
  return infoStr;
}
