const [ , , realNo, realResultFolderPath ] = process.argv

import axios from "axios"
import { createWriteStream, existsSync, mkdirSync, writeFileSync } from 'fs'
import { resolve, basename } from 'path'

const mainUrl = 'https://oriental-dic.dankook.ac.kr/hanjaeo/node?itemId=hanjaeo&gubun=radical&depth=1&upPath=&dataId=HH_' // 1-548
// const mainUrl = 'https://oriental-dic.dankook.ac.kr/hanjaeo/node?itemId=hanjaeo&gubun=vocainfo&depth=1&upPath=&dataId=HH_' // 00219_V001 total 80657
// const mainUrl = 'https://oriental-dic.dankook.ac.kr/hanjajun/node?itemId=hanjajun&gubun=radical&depth=1&upPath=&dataId=HJ_' // 1-3724
// const mainUrl = 'https://oriental-dic.dankook.ac.kr/idu/node?itemId=idu&gubun=hjum&depth=1&upPath=&dataId=ID_' // 1-4237
const imgMainUrl = 'https://oriental-dic.dankook.ac.kr'

const lexemeRegex = /(?:표제자|표제어휘) : <span class="pjhj_n" style="font-size:36px;">(.+?)</
const noNextIdRegex = /<a class="small_btn_l next" disabled >/
const nextLexemeIdRegex = /<a class="small_btn_l next".+?=[^=_"]+?_([^="]+?)"/
const imgHrefsRegex = /<img class="thumbimg".+?src="([^"]+?)"/g

main(realNo, realResultFolderPath)

async function main(lexemeId, resultFolderPath) {
  let dictId = /dataId=([^_]+?)_/.exec(mainUrl)[1].toLowerCase()
  if (dictId === 'id') {
    dictId = 'hjum'
  }

  let counter = 0

  resultFolderPath = resolve(resultFolderPath)
  if (! existsSync(resultFolderPath)) {
    mkdirSync(resultFolderPath)
  }

  if (! existsSync(`${resultFolderPath}/img`)) {
    mkdirSync(`${resultFolderPath}/img`)
  }

  while(lexemeId) {
    const lexemeUrl = `${mainUrl}${lexemeId}`
    console.log(`scraping ${lexemeUrl}`)
    
    const response = await axios.get(lexemeUrl)
    let html = response.data
    // console.log(html)
    const lexeme = lexemeRegex.exec(html)[1].trim().replace(/\//g, '_')

    const imgHrefRegexInfos = [ ...html.matchAll(imgHrefsRegex) ]

    for (const imgHrefRegexInfo of imgHrefRegexInfos) {
      const imgPath = imgHrefRegexInfo[1]
      const imgUrlPath = `${imgMainUrl}${imgPath}`
      const imgFilePath = `${resultFolderPath}/img/${basename(imgPath)}`

      console.log(`get ${imgUrlPath}`)
      const imgResponse = await axios.get(imgUrlPath, { responseType: 'stream' })
      imgResponse.data.pipe(createWriteStream(imgFilePath))

      html = html.replace(`href="${imgPath}"`, `href="${imgUrlPath}"`)
      html = html.replace(`src="${imgPath}"`, `src="${imgFilePath}"`)
    }

    const htmlFilePath = `${resultFolderPath}/${dictId}_${lexemeId}_${lexeme}.html`
    writeFileSync(htmlFilePath, html, 'utf8')

    counter ++
    console.log('done', counter)

    if (noNextIdRegex.test(html)) {
      lexemeId = false
    }
    else {
      const nextLexemeIdRegexInfo = nextLexemeIdRegex.exec(html)

      if (! nextLexemeIdRegexInfo) {
        lexemeId = false
      }
      else {
        lexemeId = nextLexemeIdRegexInfo[1]
      }
    }
  }
}
