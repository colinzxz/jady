#!/usr/bin/env node

import { Command } from 'commander'
import { changelog } from './commands/changlog'
import { lint } from './commands/lint'
import logger from './shared/logger'

const program = new Command()

// eslint-disable-next-line @typescript-eslint/no-var-requires
program.version(`jade-cli ${require('../package.json').version}`).usage('<command> [options]')

program.command('lint')
  .description('eslint code')
  .action(lint)

program.command('changelog')
  .option('-rc --releaseCount <releaseCount>', 'release count')
  .option('-f --file <file>', 'changelog filename')
  .description('generate changelog')
  .action(changelog)

program.on('command:*', ([cmd]) => {
  program.outputHelp()
  logger.error(`\nUnknown command '${cmd}'.\n`)
  process.exitCode = 1
})

program.parse()
