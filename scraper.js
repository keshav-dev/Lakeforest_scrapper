const puppeteer = require('puppeteer')
const random_useragent = require('random-useragent')
const fs = require('fs')
const { url } = require('./config')

;(async () => {
  // Open Browser
  const browser = await puppeteer.launch({ headless: false, slowMo:400 })
  const page = await browser.newPage()

  // Setup Browser
  await page.setDefaultTimeout(20000)
  await page.setViewport({ width: 1200, height: 800 })
  await page.setUserAgent(random_useragent.getRandom())

  // check if required page is loaded
  await page.goto(url)
  await page.waitForSelector('#sidebar-first')
  


  // Close Browser
  await browser.close()
})().catch(error => {
  console.log(error)
  process.exit(1)
})
