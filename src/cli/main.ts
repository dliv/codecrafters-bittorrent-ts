import { decodeCommand } from '../decode';
import { downloadCommand, downloadPieceCommand } from '../download';
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
    case 'download_piece': {
      const flag = process.argv[3];
      const saveFile = process.argv[4];
      const torrentFile = process.argv[5];
      const piece = process.argv[6];
      if (flag !== '-o') {
        throw new Error(`Expected flag -o, got ${flag}`);
      }
      const pieceNum: number = Number.parseInt(piece, 10);
      if (!(Number.isSafeInteger(pieceNum) && pieceNum >= 0)) {
        throw new Error(`bad piece: ${piece}`);
      }
      console.log(await downloadPieceCommand(saveFile, torrentFile, pieceNum));
      break;
    }
    case 'download': {
      const flag = process.argv[3];
      const saveFile = process.argv[4];
      const torrentFile = process.argv[5];
      if (flag !== '-o') {
        throw new Error(`Expected flag -o, got ${flag}`);
      }
      console.log(await downloadCommand(saveFile, torrentFile));
      break;
    }
    default:
      throw new Error(`Unknown command: ${command}`);
  }
}
