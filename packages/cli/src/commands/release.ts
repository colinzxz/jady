import { resolve } from 'path'
import { main as bump } from 'bumpp/dist/cli'
import execa from 'execa'
import fg from 'fast-glob'
import { readJsonSync, writeJsonSync } from 'fs-extra'
import { CWD } from '../shared/constant'
import logger from '../shared/logger'

export const release = async () => {
  try {
    const oldVersion = readJsonSync(resolve(CWD, 'package.json')).version
    await bump([])
    const version = readJsonSync(resolve(CWD, 'package.json')).version

    if (oldVersion === version) {
      logger.warning('Release version canceled!')
      process.exit(1)
    }

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

  packages.forEach((pkg) => {
    const pkgPath = resolve(CWD, pkg)
    const pkgJson = readJsonSync(pkgPath)
    pkgJson.version = version
    writeJsonSync(pkgPath, pkgJson, { spaces: 2 })
  })
}

async function gitStore(version: string) {
  try {
    await execa('git', ['add', '.'])
    await execa('git', ['commit', '-m', `v${version}`])
    await execa('git', ['tag', `v${version}`])
  } catch {
    logger.error('Store package.json has failed, please store manually')
  }
}
