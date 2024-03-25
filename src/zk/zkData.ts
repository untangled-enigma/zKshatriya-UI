type zkPoint = {
    x: number;
    y: number;
    key: string;
}

class zkData {
    myChests: zkPoint[];
    constructor(){
        this.myChests = []
    }

    addChest(loc: zkPoint) {
        this.myChests.push(loc)
    }

    clear() {
        this.myChests.length = 0 
    }
}

export {zkData}