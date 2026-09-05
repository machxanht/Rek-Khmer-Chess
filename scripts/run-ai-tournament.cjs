const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { execFileSync } = require('node:child_process')

const root = path.resolve(__dirname, '..')
const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rek-ai-tournament-'))

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

  const { runFullAiTournament } = require(
    path.join(outDir, 'lib', 'rek-engine', 'ai-tournament.js')
  )
  const summaries = runFullAiTournament()

  console.log('\nRek AI 200-game tournament baseline')
  console.log('===================================')
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
