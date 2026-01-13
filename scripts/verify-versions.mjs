import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'
import toml from '@iarna/toml'
import { parse as parseJsonc } from 'jsonc-parser'

const rootDir = process.cwd()

const files = {
  mise: path.join(rootDir, 'mise.toml'),
  devcontainer: path.join(rootDir, '.devcontainer/devcontainer.json'),
  action: path.join(rootDir, '.github/actions/setup-node-pnpm/action.yml'),
}

function readMise() {
  const content = fs.readFileSync(files.mise, 'utf8')
  const data = toml.parse(content)
  return {
    node: data.tools.node,
    pnpm: data.tools.pnpm,
  }
}

function readDevcontainer() {
  const content = fs.readFileSync(files.devcontainer, 'utf8')
  const data = parseJsonc(content)
  const nodeFeature = data.features['ghcr.io/devcontainers/features/node:1']
  return {
    node: nodeFeature.version,
    pnpm: nodeFeature.pnpm,
  }
}

function readAction() {
  const content = fs.readFileSync(files.action, 'utf8')
  const data = yaml.load(content)

  let nodeVersion
  let pnpmVersion

  data.runs.steps.forEach((step) => {
    if (step.uses && step.uses.startsWith('actions/setup-node')) {
      nodeVersion = String(step.with['node-version'])
    }
    // pnpm version in action is now determined by package.json packageManager field
  })

  const packageJsonPath = path.join(rootDir, 'package.json')
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
    if (packageJson.packageManager && packageJson.packageManager.startsWith('pnpm@')) {
      pnpmVersion = packageJson.packageManager.split('@')[1]
    }
  }
  catch {
    console.warn('Could not read package.json for pnpm version check')
  }

  return {
    node: nodeVersion,
    pnpm: pnpmVersion,
  }
}

try {
  console.log('Verifying versions...')
  const miseVersions = readMise()
  console.log('Mise versions:', miseVersions)

  const devVersions = readDevcontainer()
  console.log('Devcontainer versions:', devVersions)

  const actionVersions = readAction()
  console.log('Action versions:', actionVersions)

  const errors = []

  if (miseVersions.node !== devVersions.node) {
    errors.push(`Node version mismatch: Mise (${miseVersions.node}) != Devcontainer (${devVersions.node})`)
  }
  if (miseVersions.pnpm !== devVersions.pnpm) {
    errors.push(`PNPM version mismatch: Mise (${miseVersions.pnpm}) != Devcontainer (${devVersions.pnpm})`)
  }

  if (miseVersions.node !== actionVersions.node) {
    errors.push(`Node version mismatch: Mise (${miseVersions.node}) != Action (${actionVersions.node})`)
  }
  if (miseVersions.pnpm !== actionVersions.pnpm) {
    errors.push(`PNPM version mismatch: Mise (${miseVersions.pnpm}) != Action (${actionVersions.pnpm})`)
  }

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
