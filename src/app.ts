const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
import { Browser, Page } from 'puppeteer';

interface Product {
  imageUrl: string;
  title: string;
  price: number;
  fetchedOn: Date;
}

async function getPageHtml(url: string) {
  const browser: Browser = await puppeteer.launch();
  const page: Page = await browser.newPage();

  try {
    await page.goto(url);
    await page.waitForTimeout(1000);
    const html = await page.content();
    return html;
  } catch (err) {
    console.log('Could not fetch product: ', err.message);
  } finally {
    await browser.close();
  }
}

async function getProductData(url: string) {
  const html = await getPageHtml(url);
  const $ = cheerio.load(html);

  const imageUrl = $('.image-box.pdp-gallery-module_main-gallery-photo_3gh0y')
    .children('img')
    .attr('src');
  const title = $('h1').text();
  const price = $('.currency.plus.currency-module_currency_29IIm')
    .first()
    .text()
    .trim();
  const priceNumber = parseFloat(price.replace('R', '').replace(',', ''));

  const product: Product = {
    imageUrl,
    title,
    price: priceNumber,
    fetchedOn: new Date(),
  };

  return product;
}

// Main function
(async () => {
  const url = process.argv[2];
  if (!url) {
    console.log('Please provide a url');
    return;
  }
  const product = await getProductData(url);
  console.log(product);
})();
