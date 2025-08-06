const realResultHtmlFolderPath = process.argv[2]

import { globSync } from 'glob'
import naturalSort from 'javascript-natural-sort'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { basename, resolve } from 'path'

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
    let html = readFileSync(htmlPath, 'utf8').trim()
    html = html.replace(emptyJsRegex, '')
    html = html.replace(commentRegex, '')
    html = html.replace(/\r?\n	+/g, '\n').replace(/[\r\n]+/g, '<br>').replace(/><br></g, '><').replace(/><br>/g, '>').replace(/<br></g, '<')
    html = importCss + html
    html = html.replace(/><br></g, '><').replace(/><br>/g, '>').replace(/<br></g, '<')

    const lexemes = lexemeRegex.exec(htmlPath)[1].split('_')

    for (const lexeme of lexemes) {
      txtResult += `${lexeme}\r\n${html}\r\n</>\r\n`
    }
  }

  const dictId = /dankook_(hh|hj(?:um)?)/.exec(basename(htmlFolderPath))[1]

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

function addHjumLink(txtResult) {
  const linkLexemeSets = []
  const table = readFileSync('./lexemeTable/hjumlexemeList.html', 'utf8')

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

function findQuoteAndStarLexeme(lexeme, linkLexemes) {
  const lexemes4Check = [ lexeme ]

  if (/☆/.test(lexeme)) {
    const removeStarLexeme = lexeme.replace(/☆/g, '').trim()
    
    if (removeStarLexeme) {
      linkLexemes.push(removeStarLexeme)
      lexemes4Check.push(removeStarLexeme)
    }
  }

  for (const lexeme4Check of lexemes4Check) {
    if (/\([^<>\)]+?\)/.test(lexeme4Check)) {
      const removeQuoteLexeme = lexeme4Check.replace(/[\(\)]/g, '').trim()
      const removeQuoteContentLexeme = lexeme4Check.replace(/\([^<>\)]+?\)/g, '').trim()
      
      if (removeQuoteLexeme) {
        linkLexemes.push(removeQuoteLexeme)
      }

      if (removeQuoteContentLexeme) {
        linkLexemes.push(removeQuoteContentLexeme)
      }
    }
  }
}

function getRegexStrs(str, regex) {
  return [ ...str.matchAll(regex) ].map(regexInfo => regexInfo[1])
}

function getLexemes(str) {
  const lexemes = str.split(/[；\/]/)
    .map(str => str.trim())
    .filter(str => str)

  return lexemes
}
