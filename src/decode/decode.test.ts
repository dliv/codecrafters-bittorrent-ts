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

  it('can decode dictionary with array of strings', () => {
    const bencoded = 'd3:fool3:biz3:bazee';
    const buff = Buffer.from(bencoded);
    const decoded = decodeBencode(buff);
    expect(JSON.parse(String(decoded))).toEqual({ foo: ['biz', 'baz'] });
  });
});
