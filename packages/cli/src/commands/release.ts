import { resolve } from 'path'
import { main as bump } from 'bumpp/dist/cli'
import execa from 'execa'
import fg from 'fast-glob'
import { readJson, writeJson } from 'fs-extra'
import ora from 'ora'

import { CWD } from '../shared/constant'
import logger from '../shared/logger'
import { changelog } from './changlog'

export const release = async ({ publish }: { publish?: boolean } = {}) => {
  try {
    await checkGitEmpty()

    const { version: oldVersion } = await readJson(resolve(CWD, 'package.json'))
    await bump([])
    const { version } = await readJson(resolve(CWD, 'package.json'))

    if (oldVersion === version) {
      logger.warning('Release version canceled.')
      process.exit()
    }

    await changelog()
    await updateVersion(version)
    await gitStore(version)

    logger.success(`Release version ${version} successfully!`)

    if (publish) npmPublish(version)
  } catch (error: any) {
    logger.error(error.toString())
    process.exit(1)
  }
}

async function updateVersion(version: string) {
  const packages = await fg('packages/*/package.json', { cwd: CWD })

  for (const pkg of packages) {
    const pkgPath = resolve(CWD, pkg)
    const pkgJson = await readJson(pkgPath)
    pkgJson.version = version
    await writeJson(pkgPath, pkgJson, { spaces: 2 })
  }
}

async function gitStore(version: string) {
  try {
    await execa('git', ['add', '.'])
    await execa('git', ['commit', '-m', `chore: release v${version}"`])
    await execa('git', ['tag', '-a', `v${version}`, '-m', `v${version}`])
  } catch {
    logger.error('Store package.json has failed, please store manually.')
  }
}

async function checkGitEmpty() {
  const { stdout } = await execa('git', ['status', '--porcelain'])
  if (stdout) {
    logger.error('Git worktree is not empty, please commit changed.')

    process.exit()
  }
}

async function npmPublish(version: string) {
  const o = ora().start('Publish packages staring...')
  const args = ['-r', 'publish', '--access', 'public']

  version.includes('beta') && args.push('--tag', 'beta')

  const { stderr, stdout } = await execa('pnpm', args)

  if (stderr && stderr.includes('npm ERR!')) {
    throw new Error(`\n${stderr}`)
  } else {
    o.succeed('Publish all packages successfully')
    stdout && logger.info(stdout)

    gitPush()
  }
}

async function gitPush() {
  const s = ora().start('Pushing to remote git repository')
  const { stdout } = await execa('git', ['push', '--follow-tags'])
  s.succeed('Push remote repository successfully')
  stdout && logger.info(stdout)
}
