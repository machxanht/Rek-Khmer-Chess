const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { execFileSync } = require('node:child_process')

const root = path.resolve(__dirname, '..')
const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rek-engine-tests-'))

const sourceFiles = [
  'lib/rek-engine/types.ts',
  'lib/rek-engine/captures.ts',
  'lib/rek-engine/engine.ts',
  'lib/rek-engine/ai.ts',
  'lib/rek-engine/puzzles.ts',
  'lib/rek-engine/tests.ts',
  'lib/rek-engine/spec-lock-tests.ts',
  'lib/rek-engine/ai-boundary-tests.ts',
  'lib/rek-engine/state-contract-tests.ts',
  'lib/rek-engine/draw-tests.ts',
  'lib/rek-engine/puzzle-tests.ts',
  'lib/rek-engine/simulation-tests.ts',
  'lib/rek-engine/ai-quality-tests.ts',
  'lib/rek-online/types.ts',
  'lib/rek-online/room-store.ts',
  'lib/rek-online/room-tests.ts',
]

function printReport(label, report) {
  console.log(`\n${label}: ${report.passed}/${report.total} passed`)
  for (const result of report.results) {
    const mark = result.passed ? 'PASS' : 'FAIL'
    console.log(`[${mark}] ${result.id} - ${result.title}`)
    if (!result.passed && result.error) {
      console.error(`       ${result.error}`)
    }
  }
}

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
      ...sourceFiles,
    ],
    { cwd: root, stdio: 'inherit' }
  )

  const loadEngine = (name) => require(path.join(outDir, 'lib', 'rek-engine', name))
  const loadOnline = (name) => require(path.join(outDir, 'lib', 'rek-online', name))
  const { runAllUnitTests } = loadEngine('tests.js')
  const { runSpecLockTests } = loadEngine('spec-lock-tests.js')
  const { runAiBoundaryTests } = loadEngine('ai-boundary-tests.js')
  const { runStateContractTests } = loadEngine('state-contract-tests.js')
  const { runDrawTests } = loadEngine('draw-tests.js')
  const { runPuzzleTests } = loadEngine('puzzle-tests.js')
  const { runSimulationTests } = loadEngine('simulation-tests.js')
  const { runAiQualityTests } = loadEngine('ai-quality-tests.js')
  const { runOnlineRoomTests } = loadOnline('room-tests.js')

  const reports = [
    ['Rek core engine', runAllUnitTests()],
    ['Rek specification lock', runSpecLockTests()],
    ['Rek AI legality boundary', runAiBoundaryTests()],
    ['Rek GameState contract', runStateContractTests()],
    ['Rek draw adjudication', runDrawTests()],
    ['Rek published puzzles', runPuzzleTests()],
    ['Rek long-run simulations', runSimulationTests()],
    ['Rek AI tactical quality', runAiQualityTests()],
    ['Rek online room protocol', runOnlineRoomTests()],
  ]

  for (const [label, report] of reports) printReport(label, report)

  if (reports.some(([, report]) => report.failed > 0)) {
    process.exitCode = 1
  }
} finally {
  fs.rmSync(outDir, { recursive: true, force: true })
}
