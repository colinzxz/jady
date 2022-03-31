import { extname } from 'path'
import { lstatSync, pathExistsSync } from 'fs-extra'

export const isExist = pathExistsSync

export const isDir = (file: string) => isExist(file) && lstatSync(file).isDirectory()

const existAndExtname = (file: string, ext: string) => isExist(file) && extname(file) === ext

export const isSFC = (file: string) => existAndExtname(file, '.vue')

export const isMD = (file: string) => existAndExtname(file, '.md')

export const isDTS = (file: string) => existAndExtname(file, '.d.ts')
