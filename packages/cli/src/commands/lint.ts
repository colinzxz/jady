import execa from 'execa'
import ora from 'ora'
import type { Ora } from 'ora'

export const lint = async () => {
  let o: Ora
  try {
    o = ora('eslint starting...').start()
    const { stdout } = await execa('eslint', ['.', '--fix'])
    const type = stdout ? 'warn' : 'succeed'
    o[type](stdout || 'eslint success!')
  } catch (e: any) {
    o!.fail(e.toString())
    process.exit(1)
  }
}
