import {Cache } from "o1js"

import { liteEngine } from 'zkcollector-contract'

const cache = Cache.FileSystem('./public/cache');
console.time("Cache Generated in")
await liteEngine.compile({ cache });
console.timeEnd("Cache Generated in")
