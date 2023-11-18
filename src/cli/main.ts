import { decodeBencode } from '../decode/decode';
import { info } from '../info/info';

export function main() {
  const command = process.argv[2];

  switch (command) {
    case 'decode': {
      const bencodedValue = process.argv[3];
      const bytes = Buffer.from(bencodedValue, 'utf8');
      console.log(String(decodeBencode(bytes)));
      break;
    }
    case 'info': {
      const file = process.argv[3];
      console.log(info(file));
      break;
    }
    default:
      throw new Error('Not implemented');
  }
}
