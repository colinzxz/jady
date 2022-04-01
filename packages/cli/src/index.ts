#!/usr/bin/env node

import { Command } from 'commander'
import { changelog } from './commands/changlog'
import { lint } from './commands/lint'
import logger from './shared/logger'

logger.info('x')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const version = require('../package.json').version

const program = new Command()

program
  .name('jade-cli')
  .version(`jade-cli ${version}`)
  .usage('<command> [options]')

program.command('lint')
  .description('eslint code')
  .action(lint)

program.command('changelog')
  .option('-rc, --releaseCount <number>', 'release count')
  .option('-f, --file <file>', 'changelog filename')
  .description('generate changelog')
  .action(changelog)

program.on('command:*', ([cmd]) => {
  program.outputHelp()
  logger.error(`\nUnknown command '${cmd}'.\n`)
  process.exitCode = 1
})

program.parse()
