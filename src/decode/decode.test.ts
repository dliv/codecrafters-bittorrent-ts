import { decodeBencode } from './decode';

describe('decodeBencode', () => {
  it('decodes string', () => {
    expect(String(decodeBencode(Buffer.from('4:spam')))).toEqual('"spam"');
  });

  it('decodes array', () => {
    expect(String(decodeBencode(Buffer.from('l5:helloi52ee')))).toEqual(
      '["hello",52]',
    );
  });
});
