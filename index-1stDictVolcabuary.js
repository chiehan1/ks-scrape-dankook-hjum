const [ , , realResultFolderPath ] = process.argv

import axios from "axios"
import { createWriteStream, existsSync, mkdirSync, writeFileSync } from 'fs'
import { resolve, basename } from 'path'

const pageMainUrl = 'https://oriental-dic.dankook.ac.kr/hanjaeo/list?qw=&q=&itemId=hanjaeo&gubun=vocainfo&depth=1&upPath=&dataId=&sortField=&sortOrder=&pageUnit=5000&pageIndex=' // 1-17
const mainUrl = 'https://oriental-dic.dankook.ac.kr/hanjaeo/node?itemId=hanjaeo&gubun=vocainfo&depth=1&upPath=&dataId=HH_' // 00219_V001

const imgMainUrl = 'https://oriental-dic.dankook.ac.kr'

const lexemeRegex = /(?:표제자|표제어휘) : <span class="pjhj_n" style="font-size:36px;">(.+?)</
const imgHrefsRegex = /<img class="thumbimg".+?src="([^"]+?)"/g
const lexemeIdsRegex = /dataId=([^"]+?)"/g;

main(realResultFolderPath)

async function main(resultFolderPath) {
  const dictId = /dataId=([^_]+?)_/.exec(mainUrl)[1].toLowerCase()

  resultFolderPath = resolve(resultFolderPath)

  if (! existsSync(resultFolderPath)) {
    mkdirSync(resultFolderPath)
  }

  if (! existsSync(`${resultFolderPath}/img`)) {
    mkdirSync(`${resultFolderPath}/img`)
  }

  for (let i = 15; i <=17; i ++) {
    const pageUrl = `${pageMainUrl}${i}`
    const pageResponse = await axios.get(pageUrl)

    let lexemeIds = [ ...pageResponse.data.matchAll(lexemeIdsRegex) ].map(regexInfo => regexInfo[1].replace(/^[^_]+?_/, ''))
    lexemeIds = [ ...new Set(lexemeIds) ]

    for (const lexemeId of lexemeIds) {
      const lexemeUrl = `${mainUrl}${lexemeId}`
      console.log(`scraping ${lexemeUrl}`)

      const response = await axios.get(lexemeUrl)
      let html = response.data

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

      const htmlFilePath = `${resultFolderPath}/${dictId}_voca_${lexemeId}_${lexeme}.html`
      writeFileSync(htmlFilePath, html, 'utf8')

      console.log('done')
    }
  }
}
