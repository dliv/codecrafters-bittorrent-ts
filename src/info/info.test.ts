import { getInfo, infoCommand } from './info';

describe('info', () => {
  it('command works', () => {
    expect(infoCommand('sample.torrent')).toEqual(
      `\
Tracker URL: http://bittorrent-test-tracker.codecrafters.io/announce
Length: 92063
Info Hash: d69f91e6b2ae4c542468d1073a71d4ea13879a7f
Piece Length: 32768
Piece Hashes:
e876f67a2a8886e8f36b136726c30fa29703022d
6e2275e604a0766656736e81ff10b55204ad8d35
f00d937a0213df1982bc8d097227ad9e909acc17\
`,
    );
  });

  it('parse works', () => {
    expect(getInfo('sample.torrent')).toEqual({
      announce: 'http://bittorrent-test-tracker.codecrafters.io/announce',
      info: {
        length: 92063,
        name: 'sample.txt',
        'piece length': 32768,
        pieces: expect.any(String),
      },
      pieceHashes: [
        'e876f67a2a8886e8f36b136726c30fa29703022d',
        '6e2275e604a0766656736e81ff10b55204ad8d35',
        'f00d937a0213df1982bc8d097227ad9e909acc17',
      ],
      sha1: 'd69f91e6b2ae4c542468d1073a71d4ea13879a7f',
      sha1Raw: expect.any(Buffer),
    });
  });
});
