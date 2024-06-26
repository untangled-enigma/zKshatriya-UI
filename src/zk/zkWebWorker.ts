import { Field, Cache, Mina, PublicKey, ZkProgram,MerkleWitness, fetchAccount, MerkleTree, Poseidon, verify } from 'o1js';
import ky, { KyInstance } from 'ky';


type Transaction = Awaited<ReturnType<typeof Mina.transaction>>;

// ---------------------------------------------------------------------------------------

import { liteEngine } from 'zkcollector-contract'

const state = {
    gameEngine: null as null | typeof liteEngine,
    transaction: null as null | Transaction,
    chestTree: null as null | MerkleTree,
    gamer: null as null | PublicKey,
    chests: null as null | Point[],
    service: null as null | KyInstance,
    score : null as null | number
};

export type Point = {
    x: number,
    y: number,
    key: number
}

// ---------------------------------------------------------------------------------------

// PRODUCTION URLS Berkeley
// Archive https://archive.berkeley.minaexplorer.com/
// graphql https://proxy.berkeley.minaexplorer.com/graphql

const functions = {
    setActiveInstance: async (args: {}) => {
        if (!import.meta.env.VITE_GRAPHQL_URL) {
            console.log("URl NOT FOUND");
            throw new Error("Node API not set")
        }

        const Network = Mina.Network({
            mina: import.meta.env.VITE_GRAPHQL_URL
        });
        console.log('Network Instance Created');

        if (!import.meta.env.VITE_BACKEND_URL) {
            console.log("Backend Url NOT FOUND");
            throw new Error("Backend Url not set")
        }

        Mina.setActiveInstance(Network);
    },

    setGamer: async (args: { gamerPk: string, token: string }) => {
        await fetchAccount({ publicKey: args.gamerPk })
        state.gamer = PublicKey.fromBase58(args.gamerPk);
        state.service = ky.create({ prefixUrl: import.meta.env.VITE_BACKEND_URL, headers: { Authorization: `Bearer ${args.token}` } })

        //fetch map
        const result: { points: { x: number, y: number,key:number }[], score:number } = await state.service.get("api/map").json()

        //construct merkle tree
        const leaves = result.points.map((item) => {
            return Poseidon.hash([Field(item.x), Field(item.y)])
        })

        state.chests = result.points

        state.chestTree = new MerkleTree(20)
        state.chestTree.fill(leaves)
        state.score = result.score

    },

    getGamer: async (args: {}) => {
        return { address: state.gamer }
    },

    getChests:  () => state.chests,
    getScore: () => state.score,
    compileProgram: async (args: {}) => {
        state.gameEngine = liteEngine;
        console.time("Compilation Done in ");
        const cache = Cache.FileSystem('cache');
        try {
            await state.gameEngine!.compile({ cache });
        } catch (err: any) {
            console.log(err);
        }
        console.timeEnd("Compilation Done in ");
    },

    verifyItem: async (args : { point:Point  }) => {
        const height = 20;
        class MerkleWitness20 extends MerkleWitness(height) { }
        
        //@ts-ignore
        const witness = new MerkleWitness20(state.chestTree.getWitness( BigInt(args.point.key) ));

        const logLabel = `Verified Item ${args.point.key} in`
        console.time(logLabel)
        //@ts-ignore
        await state.gameEngine?.addItem( state.chestTree?.getRoot(), Field(args.point.x), Field(args.point.y)  ,witness )
        console.timeEnd(logLabel)

        return args.point.key
    },

    getProofs : async(args : {}) => {
       return await state.service?.get("api/get-proofs").json()
    },
    requestProof :  async(args : {}) => {
        return await state.service?.get("api/request-proof").json()
    },

    //To be user with zk app Address
    fetchAccount: async (args: { publicKey58: string }) => {
        const publicKey = PublicKey.fromBase58(args.publicKey58);
        return await fetchAccount({ publicKey });
    },

    /// Found treasure transaction
    /// TODO: define type in place of `any`
    commitTreasure: async (args: { items: Point[] }) : Promise<number> => {
        const items = args.items.map((x:any) => x.key + "");
        
     const resp:any = await state.service?.post("api/item/commit", {
            json : {
                items 
            } 
        }).json()

    state.score = resp.score    

    return resp.score
        
    },

    proveTransaction: async (args: {}) => {
        await state.transaction!.prove();
    },
    getTransactionJSON: async (args: {}) => {
        return state.transaction!.toJSON();
    },
};

// ---------------------------------------------------------------------------------------

export type WorkerFunctions = keyof typeof functions;

export type ZkappWorkerRequest = {
    id: number;
    fn: WorkerFunctions;
    args: any;
};

export type ZkappWorkerReponse = {
    id: number;
    data: any;
};

onmessage = async (event: MessageEvent<ZkappWorkerRequest>) => {
    const returnData = await functions[event.data.fn](event.data.args);

    const message: ZkappWorkerReponse = {
        id: event.data.id,
        data: returnData,
    };
    postMessage(message);
}

console.log('Web Worker Successfully Initialized.');