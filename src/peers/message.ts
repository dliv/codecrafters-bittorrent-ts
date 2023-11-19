import assert from 'node:assert';

import { isHandshake } from '../handshake/utils';

export enum MessageId {
  Choke = 0,
  Unchoke = 1,
  Interested = 2,
  NotInterested = 3,
  Have = 4,
  Bitfield = 5,
  Request = 6,
  Piece = 7,
  Cancel = 8,
}

export class Message {
  readonly raw: Buffer;
  readonly msgLen: number;
  readonly id: number;
  readonly payload: Buffer;

  constructor(buffer: Buffer) {
    this.raw = buffer;
    this.msgLen = Message.getMessageLength(buffer);
    this.id = Message.getMessageId(buffer);
    this.payload = Message.getMessagePayload(buffer);
    assert(MessageId[this.id], `bad id: ${this.id}`);
    assert(
      this.msgLen === this.payload.length + 1,
      `length ${this.msgLen} !== payload.length ${this.payload.length} + 1`,
    );
  }

  isA(id: MessageId): boolean {
    return this.id === id;
  }

  toString() {
    return `Message(id: ${MessageId[this.id]}, payload: ${this.msgLen - 1}b)`;
  }

  static isKeepAlive(data: Buffer): boolean {
    return data.length === 4 && Message.getMessageLength(data) === 0;
  }

  static getDebugType(data: Buffer): string {
    if (Message.isKeepAlive(data)) {
      return 'keep-alive';
    }
    const id = Message.getMessageId(data);
    if (MessageId[id]) {
      return MessageId[id];
    }
    if (isHandshake(data)) {
      return 'handshake';
    }
    return '';
  }

  static getMessageId(data: Buffer): number {
    return data.readInt8(4);
  }

  static getMessageLength(data: Buffer): number {
    return data.readInt32BE(0);
  }

  static getMessagePayload(data: Buffer): Buffer {
    return data.subarray(5);
  }

  static makeSendBuffer(id: MessageId, payload?: Buffer): Buffer {
    assert(MessageId[id], `bad id: ${id}`);
    const payloadLen = payload?.length ?? 0;
    const buffer = Buffer.alloc(5 + payloadLen);
    buffer.writeUInt32BE(1 + payloadLen, 0);
    buffer.writeUInt8(id, 4);
    if (payloadLen) {
      payload.copy(buffer, 5);
    }
    return buffer;
  }
}
