import fs from 'node:fs';

import { decodePeersResp, encodeInfoHash } from './peers';

describe('encodeInfoHash', () => {
  it('works', () => {
    const hex = 'd69f91e6b2ae4c542468d1073a71d4ea13879a7f';
    const expected = '%d6%9f%91%e6%b2%aeLT%24h%d1%07%3aq%d4%ea%13%87%9a%7f';
    expect(encodeInfoHash(hex)).toEqual(expected);
  });
});

describe('decodePeersResp', () => {
  const exampleResp = fs.readFileSync('./src/peers/peers-response-example.txt');
  it('works', () => {
    expect(decodePeersResp(exampleResp)).toEqual({
      interval: 60,
      peers: ['178.62.82.89:51470', '165.232.33.77:51467', '178.62.85.20:51489'],
    });
  });
});
