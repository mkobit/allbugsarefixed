import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'
import toml from '@iarna/toml'
import { parse as parseJsonc } from 'jsonc-parser'

const rootDir = process.cwd()

const files = {
  mise: path.join(rootDir, 'mise.toml'),
  devcontainer: path.join(rootDir, '.devcontainer/devcontainer.json'),
  action: path.join(rootDir, '.github/actions/setup-node-bun/action.yml'),
}

function readMise() {
  const content = fs.readFileSync(files.mise, 'utf8')
  const data = toml.parse(content)
  return {
    node: data.tools.node,
    bun: data.tools.bun,
  }
}

function readDevcontainer() {
  const content = fs.readFileSync(files.devcontainer, 'utf8')
  const data = parseJsonc(content)
  const nodeFeature = data.features['ghcr.io/devcontainers/features/node:1']

  const postCreateCommand = data.postCreateCommand || ''
  const bunMatch = postCreateCommand.match(/bun@([0-9.]+)/)
  const bunVersion = bunMatch ? bunMatch[1] : undefined

  return {
    node: nodeFeature.version,
    bun: bunVersion,
  }
}

function readAction() {
  const content = fs.readFileSync(files.action, 'utf8')
  const data = yaml.load(content)

  let nodeVersion
  let bunVersion

  data.runs.steps.forEach((step) => {
    if (step.uses && step.uses.startsWith('actions/setup-node')) {
      nodeVersion = String(step.with['node-version'])
    }
    if (step.uses && step.uses.startsWith('oven-sh/setup-bun')) {
      bunVersion = String(step.with['bun-version'])
    }
  })

  return {
    node: nodeVersion,
    bun: bunVersion,
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
  if (miseVersions.bun !== devVersions.bun) {
    errors.push(`Bun version mismatch: Mise (${miseVersions.bun}) != Devcontainer (${devVersions.bun})`)
  }

  if (miseVersions.node !== actionVersions.node) {
    errors.push(`Node version mismatch: Mise (${miseVersions.node}) != Action (${actionVersions.node})`)
  }
  if (miseVersions.bun !== actionVersions.bun) {
    errors.push(`Bun version mismatch: Mise (${miseVersions.bun}) != Action (${actionVersions.bun})`)
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
