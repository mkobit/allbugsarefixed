import fs from 'node:fs'
import path from 'node:path'
import actionData from '../.github/actions/setup-node-bun/action.yml' with { type: 'yaml' }
import toml from '@iarna/toml'
import { parse as parseJsonc } from 'jsonc-parser'

interface ActionYaml {
  runs?: {
    steps?: Array<{
      uses?: string
      with?: Record<string, unknown>
    }>
  }
}

interface MiseToml {
  tools?: {
    bun?: string
  }
}

const rootDir = process.cwd()

const files = {
  action: path.join(rootDir, '.github/actions/setup-node-bun/action.yml'),
  devcontainer: path.join(rootDir, '.devcontainer/devcontainer.json'),
  mise: path.join(rootDir, 'mise.toml'),
}

function readMise(): { bun: string | undefined } {
  const content = fs.readFileSync(files.mise, 'utf8')
  const data = toml.parse(content) as MiseToml
  return {
    bun: data.tools?.bun,
  }
}

function readDevcontainer(): { bun: string | undefined } {
  const content = fs.readFileSync(files.devcontainer, 'utf8')
  const data = parseJsonc(content) as { postCreateCommand?: string }

  const postCreateCommand = data.postCreateCommand || ''
  const bunMatch = postCreateCommand.match(/bun-v([0-9.]+)/)
  const bunVersion = bunMatch ? bunMatch[1] : undefined

  return {
    bun: bunVersion,
  }
}

function readAction(): { bun: string | undefined } {
  const data = actionData as ActionYaml
  const setupStep = data.runs?.steps?.find(step => step.uses?.startsWith('oven-sh/setup-bun'))
  const bunVersion = setupStep?.with ? String(setupStep.with['bun-version']) : undefined

  return {
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

  const checks = [
    miseVersions.bun !== devVersions.bun ? `Bun version mismatch: Mise (${miseVersions.bun}) != Devcontainer (${devVersions.bun})` : undefined,
    miseVersions.bun !== actionVersions.bun ? `Bun version mismatch: Mise (${miseVersions.bun}) != Action (${actionVersions.bun})` : undefined,
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
