/**
 * Mocha runner used as the main module so the ts-node loader is not asked
 * to load mocha/bin (which can cause "Format was 'null'" in Node 20+).
 * Invokes Mocha's CLI main(), which will load .mocharc.json and run tests.
 */
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
require('mocha/lib/cli/cli').main()
