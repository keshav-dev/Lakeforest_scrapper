const puppeteer = require('puppeteer')
const random_useragent = require('random-useragent')
const fs = require('fs')
const { url } = require('./config')

;(async () => {
  // Open Browser
  const browser = await puppeteer.launch({ headless: true, slowMo:10 })
  const page = await browser.newPage()

  // Setup Browser
  await page.setDefaultTimeout(20000)
  await page.setViewport({ width: 1200, height: 800 })
  await page.setUserAgent(random_useragent.getRandom())

  // check if required page is loaded
  await page.goto(url)
  await page.waitForSelector('#sidebar-first')

  const selector = '#block-aba-product-browse-ababook-browse > div > div > ul'

  // clicking on "fiction" category to scrap from it
  await page.click(`${selector} > li:nth-child(10) > a`)

  // waiting for unique selector to make sure books from fiction category are visible
  await page.waitForSelector('#block-aba-product-browse-ababook-browse > div > a')

  const tableSelector = '#block-system-main > div > div > div.view-content > table > tbody';

  const pageSelector = '#block-system-main > div > div > div.item-list > ul > li.pager-current'
  
  // initialising file pointer to log the data
  const logger = fs.createWriteStream('log.txt', { flags: 'a' })

  // function for visiting a page, and then scrapping all 12 books from it
  const pageScrapper = async (pageNo) => {
    const newPage = await browser.newPage();
    await newPage.goto(`https://www.lakeforestbookstore.com/browse/book/FIC000000?page=${pageNo-1}`)
    await newPage.waitForSelector(`${pageSelector}`)

    for(let row=1;row<=4;row++){
      for(let col=1;col<=3;col++){
        const boxSelector = `${tableSelector} > tr.row-${row} > td.col-${col}`;
        const bookName =  await newPage.$eval(`${boxSelector} > div:nth-child(2) > span > a`,element=>element.innerText);
        const authorName =  await newPage.$eval(`${boxSelector} > div:nth-child(3) > span > a`,element=>element.innerText);
        const price = await newPage.$eval(`${boxSelector} > div:nth-child(4) > span`,element=>element.innerText);
        logger.write(`book No. ${(row-1)*3+col+(pageNo-1)*12} -- \n`)
        logger.write(`  BookName: ${bookName}\n`)
        logger.write(`  author: ${authorName}\n`)
        logger.write(`  price: ${price}\n`)
      }
    }
    await newPage.close();
  }


  // Calling pageScrapper function for every page from 1 to 100 in fiction category
  for(let pageNo=1;pageNo<=100;pageNo++){
    await pageScrapper(pageNo);
  }
  
  // closing logger file
  logger.close()

  // Close Browser
  await browser.close()
})().catch(error => {
  console.log(error)
  process.exit(1)
})
