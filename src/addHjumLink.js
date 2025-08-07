import { readFileSync } from 'fs'
import { findQuoteAndStarLexeme, getRegexStrs, getLexemes } from './tools.js'

export function addHjumLink(txtResult) {
  const linkLexemeSets = []
  const table = readFileSync('./lexemeTable/hjumLexemeList.html', 'utf8')

  const lexemeStrsRegex = />([^<]*?)<\/a/g
  const trsRegex = /<td>\d+<([\s\S]+?)<\/tr>/g
  const trs = getRegexStrs(table, trsRegex)

  for (const tr of trs) {
    //console.log(tr)
    let linkLexemes = []

    const lexemeStrs = getRegexStrs(tr, lexemeStrsRegex)

    const unSplitMainLexeme = lexemeStrs.shift().trim()

    const mainLexemes = getLexemes(unSplitMainLexeme)

    for (const mainLexeme of mainLexemes) {
      if (mainLexeme !== unSplitMainLexeme) {
        linkLexemes.push(mainLexeme)
      }

      findQuoteAndStarLexeme(mainLexeme, linkLexemes)

      for (const lexemeStr of lexemeStrs) {
        const lexemes = getLexemes(lexemeStr)
        
        for (const lexeme of lexemes) {
          linkLexemes.push(lexeme)
          findQuoteAndStarLexeme(lexeme, linkLexemes)
        }
      }
    }

    linkLexemes = [ ...new Set(linkLexemes) ]

    for (const linkLexeme of linkLexemes) {
      linkLexemeSets.push([ linkLexeme, unSplitMainLexeme ])
    } 
  }

  for (const [ linkLexeme, mainLexeme ] of linkLexemeSets) {
    txtResult += `${linkLexeme}\r\n@@@LINK=${mainLexeme}\r\n</>\r\n`
  }

  return txtResult
}
