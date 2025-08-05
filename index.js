import axios from "axios"
import { writeFileSync } from 'fs'

// const mainUrl = 'https://oriental-dic.dankook.ac.kr/idu/node?itemId=idu&gubun=hjum&depth=1&upPath=&dataId=ID_' // 1-4237
// const mainUrl = 'https://oriental-dic.dankook.ac.kr/hanjaeo/node?itemId=hanjaeo&gubun=radical&depth=1&upPath=&dataId=HH_' // 1-548
const mainUrl = 'https://oriental-dic.dankook.ac.kr/hanjajun/node?itemId=hanjajun&gubun=radical&depth=1&upPath=&dataId=HJ_' // 1-3724
const lexemeRegex = /(?:표제자|표제어휘) : <span class="pjhj_n" style="font-size:36px;">(.+?)</

main()

async function main() {
  for (let i = 1; i <= 3724; i ++) {
    const lexemeId = String(i).padStart(5, '0')
    const lexemeUrl = `${mainUrl}${lexemeId}`
    console.log(`scraping ${lexemeUrl}`)

    const response = await axios.get(lexemeUrl)
    const html = response.data
    // console.log(html)
    const lexeme = lexemeRegex.exec(html)[1].trim().replace(/\//g, '_')

    const htmlFilePath = `./dankook_hj_html_results/hj_${lexemeId}_${lexeme}.html`
    writeFileSync(htmlFilePath, html, 'utf8')
    console.log('done')
  }
}