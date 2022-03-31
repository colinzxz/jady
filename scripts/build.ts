import { resolve } from 'path'
import execa from 'execa'
import ora from 'ora'

const CWD = process.cwd()
const PKG_CLI = resolve(CWD, './packages/cli')

export const buildCli = () => execa('pnpm', ['build'], { cwd: PKG_CLI })

export const run = async(name: string, task: () => any) => {
  const o = ora().start(`Building ${name} starting...`)
  try {
    await task()
    o.succeed(`Build ${name} completed!`)
  } catch (e: any) {
    o.fail(`Build ${name} failed!`)
    console.error(e.toString())
  }
}
