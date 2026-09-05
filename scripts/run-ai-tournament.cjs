const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { execFileSync } = require('node:child_process')

const root = path.resolve(__dirname, '..')
const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rek-ai-tournament-'))

function readPositiveIntArg(name, fallback) {
  const prefix = `--${name}=`
  const raw = process.argv.slice(2).find((arg) => arg.startsWith(prefix))
  if (!raw) return fallback
  const value = Number(raw.slice(prefix.length))
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer`)
  }
  return value
}

const gamesPerMode = readPositiveIntArg('games-per-mode', 2)
const openingPlies = readPositiveIntArg('opening-plies', 4)
const maxPlies = readPositiveIntArg('max-plies', 160)

try {
  const tscBin = require.resolve('typescript/bin/tsc')
  execFileSync(
    process.execPath,
    [
      tscBin,
      '--pretty',
      'false',
      '--target',
      'ES2020',
      '--module',
      'commonjs',
      '--moduleResolution',
      'node',
      '--strict',
      '--skipLibCheck',
      '--esModuleInterop',
      '--rootDir',
      root,
      '--outDir',
      outDir,
      'lib/rek-engine/types.ts',
      'lib/rek-engine/captures.ts',
      'lib/rek-engine/engine.ts',
      'lib/rek-engine/session.ts',
      'lib/rek-engine/ai.ts',
      'lib/rek-engine/ai-tournament.ts',
    ],
    { cwd: root, stdio: 'inherit' }
  )

  const { runAiTournamentBaseline } = require(
    path.join(outDir, 'lib', 'rek-engine', 'ai-tournament.js')
  )
  const summaries = runAiTournamentBaseline(gamesPerMode, { openingPlies, maxPlies })

  console.log(`\nRek AI tournament baseline — ${gamesPerMode * 2} games total`)
  console.log('====================================================')
  console.log(`Opening plies: ${openingPlies}; max plies/game: ${maxPlies}`)
  for (const summary of summaries) {
    console.log(`\n${summary.mode} — ${summary.games} games`)
    console.log(`Hard wins: ${summary.hardWins}`)
    console.log(`Medium wins: ${summary.mediumWins}`)
    console.log(`Engine draws: ${summary.draws}`)
    console.log(`Max-ply capped: ${summary.capped}`)
    console.log(`Illegal moves: ${summary.illegalMoves}`)
    console.log(`Average plies: ${summary.averagePlies.toFixed(2)}`)
    console.log(`Max game plies: ${summary.maxGamePlies}`)
    console.log(`Max nodes / move: ${summary.maxSearchNodes}`)
    console.log(`Hard search nodes: ${summary.hardSearchNodes}`)
    console.log(`Medium search nodes: ${summary.mediumSearchNodes}`)
  }

  if (summaries.some((summary) => summary.illegalMoves !== 0)) {
    process.exitCode = 1
  }
} finally {
  fs.rmSync(outDir, { recursive: true, force: true })
}
