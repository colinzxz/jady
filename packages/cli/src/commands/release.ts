import { resolve } from 'path'
import { main as bump } from 'bumpp/dist/cli'
import execa from 'execa'
import fg from 'fast-glob'
import { readJson, writeJson } from 'fs-extra'
import { CWD } from '../shared/constant'
import logger from '../shared/logger'
import { changelog } from './changlog'

export const release = async () => {
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
    await execa('git', ['commit', '-m', `v${version}`])
    await execa('git', ['tag', `v${version}`])
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
