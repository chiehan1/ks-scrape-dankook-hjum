const realFolderPath = process.argv[2]

import { globSync } from 'glob'
import { readFileSync, renameSync } from 'fs'
import { resolve } from 'path'

const lexemeRegex = /(?:표제자|표제어휘) : <span class="pjhj_n" style="font-size:36px;">(.+?)</

main(realFolderPath)

function main(folderPath) {
  folderPath = resolve(folderPath)

  const htmlPaths = globSync(`${folderPath}/**/*.html`)

  for (const htmlPath of htmlPaths) {
    const html = readFileSync(htmlPath, 'utf8')

    const lexeme = lexemeRegex.exec(html)[1].trim().replace(/\//g, '_')
    const newFilePath = htmlPath.replace(/표제어휘\.html$/, `${lexeme}.html`)

    if (htmlPath === newFilePath) {
      console.log(`same: ${htmlPath}`)
      continue
    }

    console.log(`rename: ${htmlPath} \n>> ${newFilePath}`)
    renameSync(htmlPath, newFilePath)
  }
}
