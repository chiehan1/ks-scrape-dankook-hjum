export function findQuoteAndStarLexeme(lexeme, linkLexemes) {
  const lexemes4Check = [ lexeme ]

  if (/[☆★]/.test(lexeme)) {
    const removeStarLexeme = lexeme.replace(/[☆★]/g, '').trim()
    
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

export function getRegexStrs(str, regex) {
  return [ ...str.matchAll(regex) ].map(regexInfo => regexInfo[1])
}

export function getLexemes(str) {
  const lexemes = str.split(/[；\/,]/)
    .map(str => str.trim())
    .filter(str => str)

  return lexemes
}
