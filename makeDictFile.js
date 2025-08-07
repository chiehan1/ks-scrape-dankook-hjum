const realResultHtmlFolderPath = process.argv[2]

import { globSync } from 'glob'
import naturalSort from 'javascript-natural-sort'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { basename, resolve } from 'path'
import { addHjumLink } from './src/addHjumLink.js'
import { addHjLink } from './src/addHjLink.js'
import { addHhWordLink } from './src/addHhWordLink.js'
import { addHhVocaLink } from './src/addHhVocaLink.js'

const importCss = '<link rel="stylesheet" href="style/base.css"><link rel="stylesheet" href="style/content.css"><link rel="stylesheet" href="style/common.css">'
const emptyJsRegex = /<script [^>]+?>[\s\S]+?<\/script>/g
const lexemeRegex = /\d+_([^V/\\]+?)\.html/
const commentRegex = /<!--[^>]+?-->/g

main(realResultHtmlFolderPath)

async function main(htmlFolderPath) {
  htmlFolderPath = resolve(htmlFolderPath)
  const mdxFolderName = basename(htmlFolderPath).replace('_html_results', '')
  const mdxFolderPath = `./${mdxFolderName}`
  if (! existsSync(mdxFolderPath)) {
    mkdirSync(mdxFolderPath)
    mkdirSync(`${mdxFolderPath}/style`)
  }

  let txtResult = ''

  const htmlPaths = globSync(`${htmlFolderPath}/*.html`).sort(naturalSort)

  for (const htmlPath of htmlPaths) {
    console.log(`process ${htmlPath}`)
    let html = readFileSync(htmlPath, 'utf8').trim()
    html = html.replace(emptyJsRegex, '')
    html = html.replace(commentRegex, '')
    html = html.replace(/\r?\n	+/g, '\n').replace(/[\r\n]+/g, '<br>').replace(/><br></g, '><').replace(/><br>/g, '>').replace(/<br></g, '<')
    html = importCss + html
    html = html.replace(/><br></g, '><').replace(/><br>/g, '>').replace(/<br></g, '<')

    const lexeme = lexemeRegex.exec(htmlPath)[1].replace(/_/g, '/')
    txtResult += `${lexeme}\r\n${html}\r\n</>\r\n`
  }

  const dictId = /dankook_(hh|hj(?:um)?)/.exec(basename(htmlFolderPath))[1]

  if ('hjum' === dictId) {
    txtResult = addHjumLink(txtResult)
  }
  else if ('hj' === dictId) {
    txtResult = addHjLink(txtResult)
  }
  else if ('hh' === dictId) {
    txtResult = addHhWordLink(txtResult)
    txtResult = addHhVocaLink(txtResult)
  }

  writeFileSync(`${mdxFolderPath}/${mdxFolderName}.txt`, txtResult.trim(), 'utf8')
}
