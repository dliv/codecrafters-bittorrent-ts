import assert from 'node:assert';
import crypto from 'node:crypto';
import { Socket } from 'node:net';

import { Handshake, getHandshake, parseHandshake } from '../handshake/utils';
import { TorrentInfo } from '../info';
import { Message, MessageId } from './message';
import { seconds, minutes, getPieceLength, getBlocksForTorrentPiece } from './utils';

enum State {
  Unconnected = 'unconnected',
  Connected = 'connected',
  Handshaked = 'handshaked',
  Downloading = 'downloading',
  Error = 'error',
  Closed = 'closed',
}

const DEFAULT_WAIT = seconds(60);

export class PeerConnection {
  private readonly received: Buffer[] = [];
  private state: State = State.Unconnected;
  private socket: Socket;
  private bitfield: Message | null = null;

  // spec says we start choked
  private choke = true;

  constructor(
    private readonly torrent: TorrentInfo,
    private readonly peer: string,
  ) {}

  async downloadSinglePiece(pieceNum: number): Promise<Buffer> {
    assert(pieceNum >= 0, `pieceNum ${pieceNum} < 0`);
    assert(
      pieceNum < this.torrent.pieceHashes.length,
      `index out of bounds: pieceNum ${pieceNum}, pieceHashes.length ${this.torrent.pieceHashes.length}`,
    );

    if (this.state !== State.Handshaked) {
      await this.handshake();
    }
    this.state = State.Downloading;
    console.error(
      `Attempting download of piece ${pieceNum} of ${this.torrent.pieceHashes.length} from peer ${this.peer}`,
    );

    // instructions: wait for bitfield

    // get to state where we can request piece
    {
      await this.sendMessage(MessageId.Interested);
      let msg = await this.getNextMessage(minutes(5));
      if (msg.isA(MessageId.Bitfield)) {
        this.bitfield = msg;
        // instructions: send interested
        msg = await this.getNextMessage(minutes(5));
      }
      assert(msg.isA(MessageId.Unchoke), 'expected unchoke');
      this.choke = false;
    }

    // const expectedPieceLen = getPieceLength(this.torrent, pieceNum);
    const blocks: Buffer[] = [];

    const blockLens = getBlocksForTorrentPiece(this.torrent, pieceNum);
    // const baseBlockLen = blockLens[0];
    let copied = 0;
    for (let i = 0; i < blockLens.length; i++) {
      const blockLen = blockLens[i];
      await this.sendRequest(pieceNum, i, blockLen);
      const pieceMsg = await this.getNextMessage(minutes(5));
      assert(pieceMsg.isA(MessageId.Piece), `expected piece, got: ${pieceMsg}`);
      console.error(`Piece message for p${pieceNum} b${i} ${pieceMsg}`, pieceMsg.payload);

      // maybe this would need to be relaxed if we're pipelining
      const rcvdPieceNum = pieceMsg.payload.readInt32BE(0);
      assert(rcvdPieceNum === pieceNum, `rcvdPieceNum ${rcvdPieceNum} !== pieceNum ${pieceNum}`);

      const rcvdOffset = pieceMsg.payload.readInt32BE(4);
      assert(rcvdOffset === i, `offset ${rcvdOffset} does not match expected block number ${i}`);

      const rcvdPayload = pieceMsg.payload.subarray(8);
      assert(rcvdPayload.length === blockLen, `rcvdPayload.length ${rcvdPayload.length} !== blockLen ${blockLen}`);
      blocks[rcvdOffset] = rcvdPayload;
      copied += rcvdPayload.length;
    }

    const pieceBuff = Buffer.concat(blocks);
    console.error(`Piece buffer p${pieceNum} size ${pieceBuff.length}b (copied: ${copied})`, pieceBuff);

    // validate post conditions
    {
      assert(copied === pieceBuff.length, `copied ${copied} !== pieceBuff.length ${pieceBuff.length}`);

      // sha1
      const hasher = crypto.createHash('sha1');
      hasher.update(pieceBuff);
      const sha1 = hasher.digest('hex');
      // assert(
      //   sha1 === this.torrent.pieceHashes[pieceNum],
      //   `sha1 ${sha1} !== expected ${this.torrent.pieceHashes[pieceNum]}`,
      // );
    }

    return pieceBuff;
  }

  async handshake(maxWait = DEFAULT_WAIT): Promise<Handshake> {
    assert(
      this.state === State.Unconnected || this.state === State.Connected,
      `handshake started in state: ${this.state}`,
    );

    if (this.state !== State.Connected) {
      await this.connect();
    }

    assert(this.state === State.Connected, `handshake started in state: ${this.state}`);

    const clientHandshake = getHandshake(this.torrent);
    console.error(`Tx ${this.getDebugBufferStr(clientHandshake)}`, clientHandshake);
    await new Promise<void>((resolve, reject) => {
      this.socket.write(clientHandshake, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });

    // assume return handshake fits in one data
    const serverHandshake = await this.getNextBuffer(maxWait);
    const parsed = parseHandshake(serverHandshake);
    return parsed;
  }

  private connect(maxWait = DEFAULT_WAIT): Promise<void> {
    assert(this.state === State.Unconnected, `connect started in state: ${this.state}`);
    const [host, portStr] = this.peer.split(':');
    const port = Number.parseInt(portStr, 10);
    if (!(Number.isSafeInteger(port) && port > 0)) {
      throw new Error(`bad port: ${portStr}`);
    }

    const conn = this;

    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Connection to ${this.peer} timed out after ${maxWait}ms}`));
        conn.state = State.Error;
      }, maxWait);
      conn.socket = new Socket()
        .on('data', this.handleData)
        .on('close', this.handleClose)
        .on('error', this.handleError)
        .connect(port, host, () => {
          console.error(`Connected to peer ${this.peer}`);
          conn.state = State.Connected;
          clearTimeout(timeout);
          resolve();
        });
    });
  }

  close = async () => {
    console.error(`Closing connection to ${this.peer}`);
    this.received.length = 0;
    if (![State.Error, State.Closed].includes(this.state)) {
      this.state = State.Closed;
    }
    this.socket.destroy();
  };

  // TODO: loop - each piece has multiple blocks, the last may not be a full size block
  private async sendRequest(piece = 0, block = 0, blockLen = 16 * 1024): Promise<void> {
    if (this.choke) {
      throw new Error('sent request while choked');
    }
    console.error(`Sending request for piece ${piece}, block ${block}, length ${blockLen}`);
    const req = Buffer.alloc(12);
    req.writeUInt32BE(piece, 0);
    req.writeUInt32BE(block, 4);
    req.writeUInt32BE(blockLen, 8);
    return this.sendMessage(MessageId.Request, req);
  }

  private async sendMessage(id: MessageId, payload?: Buffer): Promise<void> {
    const buffer = Message.makeSendBuffer(id, payload);
    return new Promise((resolve, reject) => {
      this.socket.write(buffer, (err) => {
        const debugStr = this.getDebugBufferStr(buffer);
        if (err) {
          console.error(`Error Tx ${debugStr}`, buffer);
          reject(err);
        } else {
          console.error(`Tx ${debugStr}`, buffer);
          resolve();
        }
      });
    });
  }

  private getDebugBufferStr = (buffer: Buffer): string => {
    const debugStr = `${buffer.length}b\t${Message.getDebugType(buffer)}\t`;
    return debugStr;
  };

  private handleData = (data: Buffer) => {
    console.error(`Rx ${this.getDebugBufferStr(data)}`, data);
    this.received.push(data);
  };

  private handleError = (err: Error) => {
    console.error('Error', err);
    this.state = State.Error;
  };

  private handleClose = () => {
    console.error('Closed');
    if (this.state !== State.Error) {
      this.state = State.Closed;
    }
  };

  private getNextMessage = async (maxWait = DEFAULT_WAIT * 10): Promise<Message> => {
    const firstBuff = await this.getNextBuffer(maxWait);
    const statedMessageLen = firstBuff.readInt32BE(0);
    const statedMessageId = firstBuff.readInt8(4);
    assert(
      statedMessageLen >= firstBuff.length - 5,
      `statedPayloadLen: ${statedMessageLen}, buff.length: ${firstBuff.length}`,
    );
    if (firstBuff.length - 4 === statedMessageLen) {
      const msg = new Message(firstBuff);
      return msg;
    }
    console.error(
      `Got partial payload for message type ${statedMessageId}, received: ${
        firstBuff.length - 4
      } of ${statedMessageLen}`,
    );
    const totalBuff = Buffer.alloc(statedMessageLen + 4);
    firstBuff.copy(totalBuff, 0);

    let iterationLimit = 10;
    let copied = firstBuff.length;
    do {
      const left = totalBuff.length - copied;
      console.error(
        `Copied ${((copied / totalBuff.length) * 100).toFixed(0)}%  ${copied} of ${
          totalBuff.length
        }, remaining: ${left} `,
      );
      assert(iterationLimit-- > 0, `too many iterations`);
      const next = await this.getNextBuffer(maxWait);
      if (Message.isKeepAlive(next)) {
        console.error(`Got keep-alive while waiting for more data in same block, continuing`);
        continue;
      }
      next.copy(totalBuff, copied);
      copied += next.length;
    } while (copied < totalBuff.length);
    assert(copied === totalBuff.length, `copied ${copied} !== totalBuff.length ${totalBuff.length}}`);
    return new Message(totalBuff);
  };

  private getNextBuffer = async (maxWait = DEFAULT_WAIT): Promise<Buffer> => {
    // hack - seems like there should be a way to wrap the socket handler in an async generator
    return new Promise((resolve, reject) => {
      const current = this.received.shift();
      if (current) {
        // console.error(`No wait`);
        resolve(current);
        return;
      }

      const cancelLimit = setTimeout(() => {
        reject(new Error(`Timeout, waited longer than ${maxWait}ms`));
      }, maxWait);

      const cancelCheck = setInterval(() => {
        // process.stderr.write(`.`);
        if (
          [State.Error, State.Closed].includes(this.state) &&
          // the connection could be closed before the interval allows the consumer to pop the buffered message(s)
          !this.received.length
        ) {
          // process.stderr.write(`\n`);
          clearInterval(cancelCheck);
          clearTimeout(cancelLimit);
          reject(
            new Error(
              `getNextBuffer() -> cancelCheck -> state: ${this.state}, received.length: ${this.received.length}`,
            ),
          );
          return;
        }
        const current = this.received.shift();
        if (current) {
          // process.stderr.write(`\n`);
          resolve(current);
          clearInterval(cancelCheck);
          clearTimeout(cancelLimit);
        }
      }, 100);
    });
  };
}
