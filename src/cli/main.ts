import { decodeCommand } from '../decode';
import { infoCommand } from '../info';
import { peersCommand } from '../peers';

export async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'decode': {
      const bencodedValue = process.argv[3];
      console.log(decodeCommand(bencodedValue));
      break;
    }
    case 'info': {
      const file = process.argv[3];
      console.log(infoCommand(file));
      break;
    }
    case 'peers': {
      const file = process.argv[3];
      console.log(await peersCommand(file));
      break;
    }
    default:
      throw new Error('Not implemented');
  }
}
