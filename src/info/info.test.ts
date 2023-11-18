import { info } from './info';

describe('info', () => {
  it('works', () => {
    expect(info('sample.torrent')).toEqual(
      `\
Tracker URL: http://bittorrent-test-tracker.codecrafters.io/announce
Length: 92063
Info Hash: d69f91e6b2ae4c542468d1073a71d4ea13879a7f\
`,
    );
  });
});
