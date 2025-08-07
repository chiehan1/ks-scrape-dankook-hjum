const realResultHtmlFolderPath = process.argv[2]

import { globSync } from 'glob'
import naturalSort from 'javascript-natural-sort'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { basename, resolve } from 'path'
import { addHjumLink } from './src/addHjumLink.js'
import { addHjLink } from './src/addHjLink.js'

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
    // const lexemes = lexemeRegex.exec(htmlPath)[1].split('_')

    // for (const lexeme of lexemes) {
    //   txtResult += `${lexeme}\r\n${html}\r\n</>\r\n`
    // }
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
    //txtResult = addHhVocaLink(txtResult)
  }

  writeFileSync(`${mdxFolderPath}/${mdxFolderName}.txt`, txtResult.trim(), 'utf8')
}

function addHhVocaLink(txtResult) {
  const linkLexemeSets = []
  const table = readFileSync('./lexemeTable/hhVocaList.html', 'utf8')

  const lexemeStrsRegex = />([^<]*?)<\/a/g
  const trsRegex = /<td>\d+<([\s\S]+?)<\/tr>/g
  const trs = getRegexStrs(table, trsRegex)

  for (const tr of trs) {
    //console.log(tr)
    const lexemeStrs = getRegexStrs(tr, lexemeStrsRegex)

    const mainLexemes = getLexemes(lexemeStrs.shift()) 

    for (const mainLexeme of mainLexemes) {
      let linkLexemes = []

      findQuoteAndStarLexeme(mainLexeme, linkLexemes)

      for (const lexemeStr of lexemeStrs) {
        const lexemes = getLexemes(lexemeStr)
        
        for (const lexeme of lexemes) {
          linkLexemes.push(lexeme)
          findQuoteAndStarLexeme(lexeme, linkLexemes)
        }
      }

      linkLexemes = [ ...new Set(linkLexemes) ]

      for (const linkLexeme of linkLexemes) {
        linkLexemeSets.push([ linkLexeme, mainLexeme ])
      } 
    }
  }

  for (const [ linkLexeme, mainLexeme ] of linkLexemeSets) {
    txtResult += `${linkLexeme}\r\n@@@LINK=${mainLexeme}\r\n</>\r\n`
  }

  return txtResult
}

function addHhWordLink(txtResult) {
  const linkLexemeSets = []
  const table = readFileSync('./lexemeTable/hhWordList.html', 'utf8')

  const lexemeStrsRegex = />([^<]*?)<\/a/g
  const trsRegex = /<td>\d+<([\s\S]+?)<\/tr>/g
  const trs = getRegexStrs(table, trsRegex)

  for (const tr of trs) {
    //console.log(tr)
    const lexemeStrs = getRegexStrs(tr, lexemeStrsRegex)

    const mainLexemes = getLexemes(lexemeStrs.shift()) 

    for (const mainLexeme of mainLexemes) {
      let linkLexemes = []

      findQuoteAndStarLexeme(mainLexeme, linkLexemes)

      for (const lexemeStr of lexemeStrs) {
        const lexemes = getLexemes(lexemeStr)
        
        for (const lexeme of lexemes) {
          linkLexemes.push(lexeme)
          findQuoteAndStarLexeme(lexeme, linkLexemes)
        }
      }

      linkLexemes = [ ...new Set(linkLexemes) ]

      for (const linkLexeme of linkLexemes) {
        linkLexemeSets.push([ linkLexeme, mainLexeme ])
      } 
    }
  }

  for (const [ linkLexeme, mainLexeme ] of linkLexemeSets) {
    txtResult += `${linkLexeme}\r\n@@@LINK=${mainLexeme}\r\n</>\r\n`
  }

  return txtResult
}
