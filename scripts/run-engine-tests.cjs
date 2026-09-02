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
  'lib/rek-engine/tests.ts',
  'lib/rek-engine/spec-lock-tests.ts',
  'lib/rek-engine/ai-boundary-tests.ts',
  'lib/rek-engine/state-contract-tests.ts',
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

  const compiledTests = path.join(outDir, 'lib', 'rek-engine', 'tests.js')
  const compiledSpecLockTests = path.join(outDir, 'lib', 'rek-engine', 'spec-lock-tests.js')
  const compiledAiBoundaryTests = path.join(outDir, 'lib', 'rek-engine', 'ai-boundary-tests.js')
  const compiledStateContractTests = path.join(outDir, 'lib', 'rek-engine', 'state-contract-tests.js')
  const { runAllUnitTests } = require(compiledTests)
  const { runSpecLockTests } = require(compiledSpecLockTests)
  const { runAiBoundaryTests } = require(compiledAiBoundaryTests)
  const { runStateContractTests } = require(compiledStateContractTests)

  const coreReport = runAllUnitTests()
  const specReport = runSpecLockTests()
  const aiReport = runAiBoundaryTests()
  const stateReport = runStateContractTests()

  printReport('Rek core engine', coreReport)
  printReport('Rek specification lock', specReport)
  printReport('Rek AI legality boundary', aiReport)
  printReport('Rek GameState contract', stateReport)

  if (
    coreReport.failed > 0 ||
    specReport.failed > 0 ||
    aiReport.failed > 0 ||
    stateReport.failed > 0
  ) {
    process.exitCode = 1
  }
} finally {
  fs.rmSync(outDir, { recursive: true, force: true })
}
