/**
 * Local runs only: find the API key in a .env file.
 *
 * Looks in two places, in order: the repo's own folder, then the folder above it (where the
 * course keeps one shared .env for every project). A value already set in the environment
 * always wins. On Netlify, keys come from the site's environment variables instead.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
export const ENV_FILES = [path.join(REPO_ROOT, '.env'), path.join(REPO_ROOT, '..', '.env')]

const KEYS = ['PORTKEY_API_KEY', 'ASSISTANT_MODEL', 'ASSISTANT_VARIANT']

function parse(file: string): Record<string, string> {
  const values: Record<string, string> = {}
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
    if (match) values[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2').trim()
  }
  return values
}

/** Fill in missing keys from the first .env that has them. Returns where the model key came from. */
export function loadLocalEnv(): string | undefined {
  let source = process.env.PORTKEY_API_KEY ? 'environment' : undefined
  for (const file of ENV_FILES) {
    if (!fs.existsSync(file)) continue
    const values = parse(file)
    for (const key of KEYS) {
      if (!process.env[key] && values[key]) {
        process.env[key] = values[key]
        if (key === 'PORTKEY_API_KEY') source = file
      }
    }
  }
  return source
}
