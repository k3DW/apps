const path = require('path')
const esbuild = require('esbuild')
const { glob } = require('glob')

async function main() {
  const outdir = path.join(__dirname, '_generated')

  const entryPoints = await glob('**/main.{ts,tsx}', {
    cwd: process.cwd(),
    ignore: 'node_modules/**',
  })

  if (entryPoints.length === 0) {
    console.error('No .ts or .tsx files found.')
    process.exit(1)
  }

  await esbuild.build({
    entryPoints,
    bundle: true,
    minify: false,
    outbase: '.',
    outdir,
  })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
