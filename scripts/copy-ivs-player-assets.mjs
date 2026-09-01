// The amazon-ivs-player NPM distribution ships its WASM decoder worker as
// static files instead of bundling them — they must be served from a public
// URL and passed to `create({ wasmWorker, wasmBinary })`. Next.js has no
// build step that copies arbitrary node_modules assets into `public/`, so
// this runs on every install to keep them in sync with the installed version.
import { copyFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const srcDir = join(root, 'node_modules', 'amazon-ivs-player', 'dist', 'assets')
const destDir = join(root, 'public', 'ivs-player')

mkdirSync(destDir, { recursive: true })
for (const file of ['amazon-ivs-wasmworker.min.js', 'amazon-ivs-wasmworker.min.wasm']) {
  copyFileSync(join(srcDir, file), join(destDir, file))
}
