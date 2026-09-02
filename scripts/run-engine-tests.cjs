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
  'lib/rek-engine/tests.ts',
]

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
  const { runAllUnitTests } = require(compiledTests)
  const report = runAllUnitTests()

  console.log(`\nRek core engine: ${report.passed}/${report.total} passed`)
  for (const result of report.results) {
    const mark = result.passed ? 'PASS' : 'FAIL'
    console.log(`[${mark}] ${result.id} - ${result.title}`)
    if (!result.passed && result.error) {
      console.error(`       ${result.error}`)
    }
  }

  if (report.failed > 0) {
    process.exitCode = 1
  }
} finally {
  fs.rmSync(outDir, { recursive: true, force: true })
}
