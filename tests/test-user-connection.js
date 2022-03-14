const { chromium } = require('playwright');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const username = "admin";
const password = "admin";
const clientURL = "#/client/MTIAYwBwb3N0Z3Jlc3Fs";
const timeoutURL = '#/client/MTMAYwBwb3N0Z3Jlc3Fs';

(async () => {
  const browser = await chromium.launch({headless: true});
  const page = await browser.newPage();
  await page.goto('http://ec2-54-87-66-8.compute-1.amazonaws.com:32001/guacamole/#/');
  await sleep(3000);
  await page.keyboard.type(username);
  await page.keyboard.press('Tab');
  await page.keyboard.type(password);
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await sleep(3000);
  await page.click(`a[href='${clientURL}']`);
  await sleep(6000);
  const errorCount = await page.locator(':text("Connection Error")').count();
  console.log(errorCount);
  if(errorCount > 0){
    console.log("Connection Error, See guacamole logs for info.");
  } else {
    console.log("Connection Successful");
  }
  await sleep(1000);
  await browser.close();
  console.log("Browser closed");
  process.exit(0);
})();