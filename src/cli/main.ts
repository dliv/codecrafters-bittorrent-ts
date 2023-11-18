import { decodeCommand } from '../decode';
import { handshakeCommand } from '../handshake';
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
    case 'handshake': {
      const file = process.argv[3];
      const peer = process.argv[4];
      console.log(await handshakeCommand(file, peer));
      break;
    }
    default:
      throw new Error(`Unknown command: ${command}`);
  }
}
