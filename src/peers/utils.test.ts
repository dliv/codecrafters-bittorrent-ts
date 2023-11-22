import { getInfo } from '../info';
import { getBlocksForTorrentPiece } from './utils';

describe('getBlocksForTorrentPiece', () => {
  const info = getInfo('sample.torrent');

  it('works for normal pieces', () => {
    expect(getBlocksForTorrentPiece(info, 0)).toEqual([16384, 16384]);
    expect(getBlocksForTorrentPiece(info, 1)).toEqual([16384, 16384]);
  });

  it('works for last piece', () => {
    expect(getBlocksForTorrentPiece(info, 2)).toEqual([16384, 10143]);
  });

  it('throws on out of bounds', () => {
    expect(() => {
      getBlocksForTorrentPiece(info, 3);
    }).toThrow();
  });
});
