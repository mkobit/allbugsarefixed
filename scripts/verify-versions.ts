import fs from 'node:fs'
import path from 'node:path'
import toml from '@iarna/toml'

interface MiseToml {
  settings?: {
    idiomatic_version_file_enable_tools?: string[]
  }
  tools?: {
    bun?: string
  }
}

interface MiseLock {
  tools?: {
    bun?: Array<{
      version?: string
    }>
  }
}

interface PackageJson {
  packageManager?: string
}

const rootDir = process.cwd()

const files = {
  action: path.join(rootDir, '.github/actions/setup-node-bun/action.yml'),
  mise: path.join(rootDir, 'mise.toml'),
  miseLock: path.join(rootDir, 'mise.lock'),
  openspec: path.join(rootDir, '.github/workflows/openspec.yml'),
  packageJson: path.join(rootDir, 'package.json'),
  sbx: path.join(rootDir, '.sbx/kit/spec.yaml'),
}

function readPackageJson(): { bun: string | undefined } {
  const content = fs.readFileSync(files.packageJson, 'utf8')
  const data = JSON.parse(content) as PackageJson
  const bunMatch = data.packageManager?.match(/^bun@([0-9.]+)/)
  return {
    bun: bunMatch ? bunMatch[1] : undefined,
  }
}

function readMise(): { bun: string | undefined, delegatesBunToPackageJson: boolean } {
  const content = fs.readFileSync(files.mise, 'utf8')
  const data = toml.parse(content) as MiseToml
  const idiomaticTools = data.settings?.idiomatic_version_file_enable_tools ?? []
  return {
    bun: data.tools?.bun,
    delegatesBunToPackageJson: idiomaticTools.includes('bun'),
  }
}

function readMiseLock(): { bun: string[] } {
  const content = fs.readFileSync(files.miseLock, 'utf8')
  const data = toml.parse(content) as MiseLock
  const bunEntries = data.tools?.bun ?? []
  return {
    bun: bunEntries
      .map(entry => entry.version)
      .filter((version): version is string => version !== undefined),
  }
}

function readAction(): { hasHardcodedVersion: boolean, usesVersionFile: boolean } {
  const content = fs.readFileSync(files.action, 'utf8')
  return {
    hasHardcodedVersion: /^\s*bun-version:/m.test(content),
    usesVersionFile: /^\s*bun-version-file:\s*["']?package\.json["']?\s*$/m.test(content),
  }
}

function readOpenspec(): { hasHardcodedVersion: boolean, usesVersionFile: boolean } {
  const content = fs.readFileSync(files.openspec, 'utf8')
  return {
    hasHardcodedVersion: /^\s*(?:BUN_VERSION|bun-version):/m.test(content),
    usesVersionFile: /^\s*bun-version-file:\s*["']?package\.json["']?\s*$/m.test(content),
  }
}

function readSbx(): { bun: string | undefined } {
  const content = fs.readFileSync(files.sbx, 'utf8')
  const bunMatch = content.match(/bun@([0-9.]+)/)
  return {
    bun: bunMatch ? bunMatch[1] : undefined,
  }
}

try {
  console.log('Verifying versions...')
  const packageJsonVersions = readPackageJson()
  console.log('Package.json (canonical) versions:', packageJsonVersions)

  const miseConfig = readMise()
  console.log('Mise config:', miseConfig)

  const miseLockVersions = readMiseLock()
  console.log('Mise lock versions:', miseLockVersions)

  const actionConfig = readAction()
  console.log('Action config:', actionConfig)

  const openspecConfig = readOpenspec()
  console.log('OpenSpec workflow config:', openspecConfig)

  const sbxVersions = readSbx()
  console.log('Docker Sandbox versions:', sbxVersions)

  const canonicalBun = packageJsonVersions.bun

  const checks = [
    canonicalBun === undefined
      ? 'package.json must declare a canonical Bun version in packageManager (e.g. "bun@1.4.4")'
      : undefined,
    miseConfig.bun !== undefined
      ? `mise.toml must not hardcode tools.bun (${miseConfig.bun}); delegate to package.json via idiomatic_version_file_enable_tools`
      : undefined,
    !miseConfig.delegatesBunToPackageJson
      ? 'mise.toml must include "bun" in settings.idiomatic_version_file_enable_tools'
      : undefined,
    canonicalBun !== undefined && (miseLockVersions.bun.length !== 1 || miseLockVersions.bun[0] !== canonicalBun)
      ? `Bun version mismatch: package.json (${canonicalBun}) != mise.lock (${miseLockVersions.bun.join(', ') || 'missing'})`
      : undefined,
    !actionConfig.usesVersionFile
      ? 'Action (.github/actions/setup-node-bun/action.yml) must set bun-version-file: package.json'
      : undefined,
    actionConfig.hasHardcodedVersion
      ? 'Action (.github/actions/setup-node-bun/action.yml) must not hardcode bun-version'
      : undefined,
    !openspecConfig.usesVersionFile
      ? 'OpenSpec workflow (.github/workflows/openspec.yml) must set bun-version-file: package.json'
      : undefined,
    openspecConfig.hasHardcodedVersion
      ? 'OpenSpec workflow (.github/workflows/openspec.yml) must not hardcode BUN_VERSION or bun-version'
      : undefined,
    canonicalBun !== undefined && canonicalBun !== sbxVersions.bun
      ? `Bun version mismatch: package.json (${canonicalBun}) != Docker Sandbox (${sbxVersions.bun})`
      : undefined,
  ]

  const errors = checks.filter((err): err is string => err !== undefined)

  if (errors.length > 0) {
    console.error('Version verification failed:')
    errors.forEach(err => console.error(`- ${err}`))
    process.exit(1)
  }
  else {
    console.log('All versions match!')
  }
}
catch (error) {
  console.error('Error during verification:', error)
  process.exit(1)
}
