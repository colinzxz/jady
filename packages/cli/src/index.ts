#!/usr/bin/env node

import { resolve } from 'path'
import { Command } from 'commander'
import { readJsonSync } from 'fs-extra'

import { changelog } from './commands/changlog'
import { lint } from './commands/lint'
import { release } from './commands/release'

import { CWD } from './shared/constant'
import logger from './shared/logger'

const version = readJsonSync(resolve(CWD, 'package.json')).version

const program = new Command()

program
  .name('jady-cli')
  .version(`jady-cli ${version}`)
  .usage('<command> [options]')

program.command('lint')
  .description('eslint code')
  .action(lint)

program.command('changelog')
  .option('-rc, --releaseCount <number>', 'release count')
  .option('-f, --file <file>', 'changelog filename')
  .description('generate changelog')
  .action(changelog)

program
  .command('release')
  .option('-p, --publish', 'publish package of npm')
  .description('release all packages and generate changelog')
  .action(release)

program.on('command:*', ([cmd]) => {
  program.outputHelp()
  logger.error(`\nUnknown command '${cmd}'.\n`)
  process.exitCode = 1
})

program.parse()
