import * as WChar from "./wchar";
import { WString } from "./wstring";

export type Operation =
  | { type: "insert"; char: WChar.t }
  | { type: "delete"; char: WChar.t };

type Subscriber =
  | { type: "value"; handler(value: string): void }
  | { type: "operation"; handler(operation: Operation): void };

export class Client {
  public buffer: WString;
  private subscribers: Subscriber[] = [];
  private clientId: number;
  private localClock = 0;
  private queue: Operation[] = [];

  constructor(clientId: number, chars?: WChar.t[]) {
    if (chars) {
      this.buffer = new WString(chars);
    } else {
      this.buffer = WString.empty();
    }
    this.clientId = clientId;
  }

  public setText(source: string) {
    for (let i = 0; i < source.length; i++) {
      const op = this.makeInsert(i, source[i]);
      this.buffer.insert(op.char);
    }

    setImmediate(() => {
      this.broadcastValue();
    });
  }

  public onValue(handler: (value: string) => void) {
    this.subscribers.push({ type: "value", handler });
  }

  public onOperation(handler: (operation: Operation) => void) {
    this.subscribers.push({ type: "operation", handler });
  }

  private broadcastOperation(operation: Operation) {
    for (const subscriber of this.subscribers) {
      if (subscriber.type === "operation") {
        subscriber.handler(operation);
      }
    }
  }

  private broadcastValue() {
    const value = this.value();
    for (const subscriber of this.subscribers) {
      if (subscriber.type === "value") {
        subscriber.handler(value);
      }
    }
  }

  private processQueue() {
    let previousQueueLength;

    do {
      previousQueueLength = this.queue.length;
      for (let i = 0; i < this.queue.length; i++) {
        if (this.processOperation(this.queue[i])) {
          this.queue.splice(i, 1);
          i -= 1;
        }
      }
    } while (this.queue.length < previousQueueLength);
  }

  private processOperation(op: Operation) {
    switch (op.type) {
      case "insert":
        return this.buffer.insert(op.char);
      case "delete":
        return this.buffer.delete(op.char);
    }
  }

  public apply(op: Operation) {
    this.queue.unshift(op);
    this.processQueue();
    this.broadcastValue();
  }

  private makeInsert(i: number, char: string): Operation {
    const prev = i === 0 ? WChar.beg : this.buffer.atVisible(i - 1);
    const next =
      i === this.buffer.length() ? WChar.fin : this.buffer.atVisible(i);

    const char_: WChar.t = {
      id: { client: this.clientId, clock: this.localClock++ },
      prev: prev.id,
      next: next.id,
      visible: true,
      value: char
    };

    return { type: "insert", char: char_ };
  }

  private makeDelete(i: number): Operation {
    const char = this.buffer.atVisible(i);
    return { type: "delete", char };
  }

  public insert(i: number, char: string) {
    const op = this.makeInsert(i, char);
    this.buffer.insert(op.char);
    this.broadcastOperation(op);
    this.broadcastValue();
  }

  public delete(i: number) {
    const op = this.makeDelete(i);
    this.buffer.delete(op.char);
    this.broadcastOperation(op);
    this.broadcastValue();
  }

  public value(): string {
    return this.buffer.value();
  }
}
(window as any).Client = Client;
