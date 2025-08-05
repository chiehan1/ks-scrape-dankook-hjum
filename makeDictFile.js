const realResultHtmlFolderPath = process.argv[2]

import { globSync } from 'glob'
import naturalSort from 'javascript-natural-sort'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { basename, resolve } from 'path'

const importCss = '<link rel="stylesheet" href="style/base.css"><link rel="stylesheet" href="style/content.css"><link rel="stylesheet" href="style/common.css">'
const emptyJsRegex = /<script [^>]+?>\s+<\/script>/g
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
    let html = readFileSync(htmlPath, 'utf8').trim()
    html = html.replace(emptyJsRegex, '')
    html = html.replace(commentRegex, '')
    html = html.replace(/\r?\n	+/g, '\n').replace(/[\r\n]+/g, '<br>').replace(/><br></g, '><')
    html = importCss + html

    const lexemes = lexemeRegex.exec(htmlPath)[1].split('_')

    for (const lexeme of lexemes) {
      txtResult += `${lexeme}\r\n${html}\r\n</>\r\n`
    }
  }

  const dictId = /dankook_(hh|hj|hjum)/.exec(basename(htmlFolderPath))[1]

  if ('hjum' === dictId) {
    txtResult = addHjumLink(txtResult)
  }
  else if ('hj' === dictId) {
    txtResult = addHjLink(txtResult)
  }
  else if ('hh' === dictId) {
    txtResult = addHhLink(txtResult)
  }

  writeFileSync(`${mdxFolderPath}/${mdxFolderName}.txt`, txtResult.trim(), 'utf8')
}

function addHhLink(txtResult) {
  const table = readFileSync('./lexemeTable/hjWordList.html', 'utf8')

  const lexemeStrsRegex = />([^<]*?)<\/a/g
  const trsRegex = /<td>\d+<([\s\S]+?)<\/tr>/g
  const trs = [ ...table.matchAll(trsRegex) ]

  for (const tr of trs) {
    const lexemeStrs = [ ...tr.matchAll(lexemeStrsRegex) ]

    const mainLexemes = getLexemes(lexemeStrs.shift()) 

    for (const mainLexeme of mainLexemes) {

      for (const lexemeStr of lexemeStrs) {
        const lexemes = getLexemes(lexemeStr)
        
        for (const lexeme of lexemes) {
          txtResult += `${lexeme}\r\n@@@LINK=${mainLexeme}\r\n</>\r\n`
        }
      }
    }
  }

  return txtResult
}

function addHjLink(txtResult) {
  const table = readFileSync('./lexemeTable/hjWordList.html', 'utf8')

  const lexemeStrsRegex = />([^<]*?)<\/a/g
  const trsRegex = /<td>\d+<([\s\S]+?)<\/tr>/g
  const trs = [ ...table.matchAll(trsRegex) ]

  for (const tr of trs) {
    const lexemeStrs = [ ...tr.matchAll(lexemeStrsRegex) ]

    const mainLexemes = getLexemes(lexemeStrs.shift()) 

    for (const mainLexeme of mainLexemes) {

      for (const lexemeStr of lexemeStrs) {
        const lexemes = getLexemes(lexemeStr)
        
        for (const lexeme of lexemes) {
          txtResult += `${lexeme}\r\n@@@LINK=${mainLexeme}\r\n</>\r\n`
        }
      }
    }
  }

  return txtResult
}

function addHjumLink(txtResult) {
  const table = readFileSync('./lexemeTable/hjWordList.html', 'utf8')

  const lexemeStrsRegex = />([^<]*?)<\/a/g
  const trsRegex = /<td>\d+<([\s\S]+?)<\/tr>/g
  const trs = [ ...table.matchAll(trsRegex) ]

  for (const tr of trs) {
    const lexemeStrs = [ ...tr.matchAll(lexemeStrsRegex) ]

    const mainLexemes = getLexemes(lexemeStrs.shift()) 

    for (const mainLexeme of mainLexemes) {

      for (const lexemeStr of lexemeStrs) {
        const lexemes = getLexemes(lexemeStr)
        
        for (const lexeme of lexemes) {
          txtResult += `${lexeme}\r\n@@@LINK=${mainLexeme}\r\n</>\r\n`
        }
      }
    }
  }

  return txtResult
}

function getLexemes(str) {
  const lexemes = str.replace(/[☆]/g, '')
    .split(/[；\/]/)
    .map(str => str.trim())
    .filter(str => str)

  return lexemes
}