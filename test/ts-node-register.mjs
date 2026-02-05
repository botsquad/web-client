import { createRequire } from 'node:module'
import { register } from 'node:module'
import { pathToFileURL } from 'node:url'

const require = createRequire(import.meta.url)
const tsNodeEsm = require.resolve('ts-node/esm')
register(tsNodeEsm, pathToFileURL(process.cwd()))
