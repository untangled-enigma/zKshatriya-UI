import { fetchAccount, PublicKey } from 'o1js';

import type {
  ZkappWorkerRequest,
  ZkappWorkerReponse,
  WorkerFunctions,
  Point
} from './zkWebWorker';



export default class WebWorkerClient {
  // ---------------------------------------------------------------------------------------

  setActiveInstance() {
    return this._call('setActiveInstance', {});
  }

  setGamer(gamerPk: string, token: string) {
    return this._call('setGamer', { gamerPk, token });
  }

  compileProgram() {
    return this._call('compileProgram', {});
  }

  foundItem({ point }: { point: Point }) : Promise<any> {
    return this._call('verifyItem', { point }) 
  }

  fetchAccount({
    publicKey,
  }: {
    publicKey: PublicKey;
  }): ReturnType<typeof fetchAccount> {
    const result = this._call('fetchAccount', {
      publicKey58: publicKey.toBase58(),
    });
    return result as ReturnType<typeof fetchAccount>;
  }

 async commitTreasure(items: Point[]): Promise<number>{
    //@ts-ignore
    return await this._call('commitTreasure', { items }) ;
  }

  proveTransaction() {
    return this._call('proveTransaction', {});
  }

  getGamer(): Promise<any> {
    return this._call('getGamer', {});
  }

  getChests() {
    return this._call('getChests', {});
  }

  getScore() {
    return this._call('getScore', {});
  }

  async getTransactionJSON() {
    const result = await this._call('getTransactionJSON', {});
    return result;
  }

  // ---------------------------------------------------------------------------------------

  worker: Worker;

  promises: {
    [id: number]: { resolve: (res: any) => void; reject: (err: any) => void };
  };

  nextId: number;

  constructor() {
    this.worker = new Worker(new URL('./zkWebWorker.ts', import.meta.url), {
      type: 'module',
    });
    this.promises = {};
    this.nextId = 0;

    this.worker.onmessage = (event: MessageEvent<ZkappWorkerReponse>) => {
      this.promises[event.data.id].resolve(event.data.data);
      delete this.promises[event.data.id];
    };

  }

  _call(fn: WorkerFunctions, args: any) {
    return new Promise((resolve, reject) => {
      this.promises[this.nextId] = { resolve, reject };

      const message: ZkappWorkerRequest = {
        id: this.nextId,
        fn,
        args,
      };

      this.worker.postMessage(message);

      this.nextId++;
    });
  }
}