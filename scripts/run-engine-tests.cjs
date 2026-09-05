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
  'lib/rek-engine/session.ts',
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
  'lib/rek-engine/ai-search-regression-tests.ts',
  'lib/rek-engine/move-regression-tests.ts',
  'lib/rek-engine/rule-guide-lock-tests.ts',
  'lib/rek-engine/public-api-tests.ts',
]

function printReport(label, report) {
  console.log(`\n${label}: ${report.passed}/${report.total} passed`)
  for (const result of report.results) {
    const mark = result.passed ? 'PASS' : 'FAIL'
    console.log(`[${mark}] ${result.id} - ${result.title}`)
    if (!result.passed && result.error) {
      console.error(`       ${result.error}`)
    } else if (label === 'Rek AI search regression' && result.passed && result.details) {
      console.log(`       ${result.details}`)
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

  const load = (name) => require(path.join(outDir, 'lib', 'rek-engine', name))
  const { runAllUnitTests } = load('tests.js')
  const { runSpecLockTests } = load('spec-lock-tests.js')
  const { runAiBoundaryTests } = load('ai-boundary-tests.js')
  const { runStateContractTests } = load('state-contract-tests.js')
  const { runDrawTests } = load('draw-tests.js')
  const { runPuzzleTests } = load('puzzle-tests.js')
  const { runSimulationTests } = load('simulation-tests.js')
  const { runAiQualityTests } = load('ai-quality-tests.js')
  const { runAiSearchRegressionTests } = load('ai-search-regression-tests.js')
  const { runMoveRegressionTests } = load('move-regression-tests.js')
  const { runRuleGuideLockTests } = load('rule-guide-lock-tests.js')
  const { runPublicApiTests } = load('public-api-tests.js')

  const reports = [
    ['Rek core engine', runAllUnitTests()],
    ['Rek specification lock', runSpecLockTests()],
    ['Rek AI legality boundary', runAiBoundaryTests()],
    ['Rek GameState contract', runStateContractTests()],
    ['Rek draw adjudication', runDrawTests()],
    ['Rek published puzzles', runPuzzleTests()],
    ['Rek long-run simulations', runSimulationTests()],
    ['Rek AI tactical quality', runAiQualityTests()],
    ['Rek AI search regression', runAiSearchRegressionTests()],
    ['Rek movement regression', runMoveRegressionTests()],
    ['Rek Khmer guide lock', runRuleGuideLockTests()],
    ['Rek public session API', runPublicApiTests()],
  ]

  for (const [label, report] of reports) printReport(label, report)

  if (reports.some(([, report]) => report.failed > 0)) {
    process.exitCode = 1
  }
} finally {
  fs.rmSync(outDir, { recursive: true, force: true })
}
