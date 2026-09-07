/**
 * Docker Sandboxes (sbx) Zod Schemas
 *
 * References:
 * - Docker Sandboxes Kit Spec v2 (normative): https://github.com/docker/sbx-kits-contrib/blob/main/spec/SPEC-v2.md
 * - Docker Docs Kit Reference: https://docs.docker.com/ai/sandboxes/customize/kit-reference/
 * - Docker Docs Environment Files: https://docs.docker.com/ai/sandboxes/configuration/environment-files/
 */

import { z } from 'zod'

// --- Identifiers & Common Patterns ---

// Kit name: ^[a-z0-9]([a-z0-9-]{0,62}[a-z0-9])?$
export const kitNameRegex = /^[a-z0-9]([a-z0-9-]{0,62}[a-z0-9])?$/
// Environment variable name: [A-Za-z_][A-Za-z0-9_]*
export const envVarNameRegex = /^[A-Za-z_][A-Za-z0-9_]*$/
// Dotted path for locked fields: ^[a-z][a-zA-Z0-9]*(\.[a-z][a-zA-Z0-9]*)*$
export const dottedPathRegex = /^[a-z][a-zA-Z0-9]*(\.[a-z][a-zA-Z0-9]*)*$/

// --- Setup Blocks (v2) ---

export const setupInstallItemSchema = z
  .object({
    command: z.string().min(1),
    description: z.string().optional(),
    user: z.string().optional(),
  })
  .strict()

export const setupStartupItemSchema = z
  .object({
    background: z.boolean().optional(),
    command: z.union([z.string().min(1), z.array(z.string().min(1)).min(1)]),
    description: z.string().optional(),
    user: z.string().optional(),
  })
  .strict()

export const setupFileItemSchema = z
  .object({
    content: z.string(),
    description: z.string().optional(),
    mode: z.string().optional(),
    onlyIfMissing: z.boolean().optional(),
    path: z.string().min(1),
  })
  .strict()

export const setupSchema = z
  .object({
    files: z.array(setupFileItemSchema).optional(),
    install: z.array(setupInstallItemSchema).optional(),
    startup: z.array(setupStartupItemSchema).optional(),
  })
  .strict()

// --- Permissions (v2) ---

export const permissionsNetworkSchema = z
  .object({
    allow: z.array(z.string().min(1)).optional(),
    deny: z.array(z.string().min(1)).optional(),
  })
  .strict()

export const permissionsSchema = z
  .object({
    network: permissionsNetworkSchema.optional(),
  })
  .strict()

// --- Environment (v2) ---

export const environmentSchema = z
  .object({
    variables: z
      .record(z.string().regex(envVarNameRegex), z.string())
      .optional(),
  })
  .strict()

// --- Ports (v2) ---

export const kitPortSchema = z
  .object({
    container: z.number().int().min(1).max(65535),
    name: z.string().optional(),
    protocol: z.enum(['tcp', 'udp']).optional(),
  })
  .strict()

// --- Agent Instructions (v2) ---

export const agentInstructionsSchema = z
  .object({
    content: z.string().optional(),
    filename: z.string().optional(),
  })
  .strict()

// --- Credentials (v2) ---

export const apiKeyInjectSchema = z
  .object({
    domain: z.string().min(1),
    format: z.string().optional(),
    header: z.string().optional(),
    scheme: z.enum(['bearer', 'basic']).optional(),
    username: z.string().optional(),
  })
  .strict()

export const credentialApiKeySchema = z
  .object({
    inject: z.array(apiKeyInjectSchema).optional(),
    name: z.string().min(1),
    proxyManaged: z.boolean().optional(),
  })
  .strict()

export const credentialOAuthSchema = z
  .object({
    credentialFile: z
      .object({
        path: z.string().min(1),
        structure: z.record(z.string(), z.unknown()).optional(),
        template: z.string().optional(),
      })
      .strict()
      .optional(),
    passthrough: z.boolean().optional(),
    resourceHosts: z.array(z.string()).optional(),
    responseFields: z.record(z.string(), z.string()).optional(),
    sentinels: z
      .object({
        accessToken: z.string().optional(),
        refreshToken: z.string().optional(),
      })
      .strict()
      .optional(),
    skipIfEnv: z.boolean().optional(),
    tokenEndpoint: z
      .object({
        host: z.string().min(1),
        path: z.string().min(1),
      })
      .strict()
      .optional(),
  })
  .strict()

export const credentialItemSchema = z
  .object({
    apiKey: credentialApiKeySchema.optional(),
    description: z.string().optional(),
    oauth: credentialOAuthSchema.optional(),
    provider: z.string().optional(),
    required: z.boolean().optional(),
    service: z.string().min(1),
  })
  .strict()

// --- Volumes (v2) ---

export const volumeItemSchema = z
  .object({
    path: z.string().min(1),
    readOnly: z.boolean().optional(),
    source: z.string().optional(),
    type: z.enum(['tmpfs', 'bind']).optional(),
  })
  .strict()

// --- Kit Spec v2 (Normative SPEC-v2) ---

const commonKitFields = {
  agentInstructions: agentInstructionsSchema.optional(),
  credentials: z.array(credentialItemSchema).optional(),
  description: z.string().optional(),
  displayName: z.string().optional(),
  environment: environmentSchema.optional(),
  licenses: z.array(z.string().min(1)).optional(),
  locked: z.array(z.string().regex(dottedPathRegex)).optional(),
  name: z.string().regex(kitNameRegex),
  permissions: permissionsSchema.optional(),
  ports: z.array(kitPortSchema).optional(),
  schemaVersion: z.literal('2'),
  security: z
    .object({
      privileged: z.boolean().optional(),
    })
    .strict()
    .optional(),
  setup: setupSchema.optional(),
  sourceURL: z.string().url().optional(),
  version: z.string().optional(),
  volumes: z.array(volumeItemSchema).optional(),
}

export const kitMixinSpecV2Schema = z
  .object({
    ...commonKitFields,
    kind: z.literal('mixin'),
    requires: z
      .object({
        agent: z.string().regex(kitNameRegex).optional(),
      })
      .strict()
      .optional(),
  })
  .strict()

export const kitSandboxSpecV2Schema = z
  .object({
    ...commonKitFields,
    extends: z.string().optional(),
    kind: z.literal('sandbox'),
    mixins: z.array(z.string()).optional(),
    sandbox: z
      .object({
        command: z
          .union([
            z.array(z.string()),
            z
              .object({
                default: z.array(z.string()).optional(),
                interactive: z.array(z.string()).optional(),
              })
              .strict(),
          ])
          .optional(),
        entrypoint: z.array(z.string().min(1)).optional(),
        image: z.string().optional(),
        resources: z
          .object({
            cpu: z.number().nonnegative().optional(),
            gpu: z.string().optional(),
            memory: z.string().optional(),
          })
          .strict()
          .optional(),
      })
      .strict(),
  })
  .strict()

export const kitSpecV2Schema = z.discriminatedUnion('kind', [
  kitMixinSpecV2Schema,
  kitSandboxSpecV2Schema,
])

// --- Legacy Kit Spec v1 ---

export const kitSpecV1Schema = z
  .object({
    commands: z
      .object({
        initFiles: z.array(z.record(z.string(), z.string())).optional(),
        install: z.array(z.string()).optional(),
        startup: z.array(z.string()).optional(),
      })
      .optional(),
    description: z.string().optional(),
    environment: z.record(z.string(), z.string()).optional(),
    kind: z.enum(['agent', 'mixin']).optional(),
    name: z.string().min(1),
    network: z
      .object({
        allowedDomains: z.array(z.string()).optional(),
        deniedDomains: z.array(z.string()).optional(),
      })
      .optional(),
    schemaVersion: z.literal('1'),
    version: z.string().optional(),
  })
  .passthrough()

export const kitSpecSchema = z.union([kitSpecV2Schema, kitSpecV1Schema])

// --- Environment File (.sbxenv.yaml) ---

export const sbxEnvPortSchema = z
  .object({
    host: z.number().int().min(1).max(65535).optional(),
    hostIP: z.string().optional(),
    protocol: z.enum(['tcp', 'tcp4', 'tcp6', 'udp', 'udp4', 'udp6']).optional(),
    sandbox: z.number().int().min(1).max(65535),
  })
  .strict()

export const sbxEnvWorkspaceSchema = z
  .object({
    clone: z.boolean(),
    path: z.string().min(1),
  })
  .strict()

export const sbxEnvV1Schema = z
  .object({
    agent: z.string().min(1),
    env: z.record(z.string(), z.string()).optional(),
    kit: z.union([z.string(), z.array(z.string())]).optional(),
    kits: z.array(z.string()).optional(),
    name: z.string().min(1),
    ports: z.array(sbxEnvPortSchema).optional(),
    schemaVersion: z.literal('1'),
    setup_commands: z.array(z.string()).optional(),
    workspace: sbxEnvWorkspaceSchema,
  })
  .strict()
