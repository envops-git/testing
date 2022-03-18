
function testUserConnection(username, password, clientName) {
  return new Promise(function (resolve, reject) {
    const playwright = require('playwright');

    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    let errorCode;

    (async () => {
      const browser = await playwright.chromium.launch({ headless: true });
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.goto('http://ec2-54-87-66-8.compute-1.amazonaws.com:32001/guacamole/#/');
      await sleep(3000);
      await page.keyboard.type(username);
      await page.keyboard.press('Tab');
      await page.keyboard.type(password);
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
      try {
        await page.click(`:text("${clientName}")`, {
          timeout: 4000,
        });
      } catch (error) {
        if (error instanceof playwright.errors.TimeoutError) {
          console.log("No connection by that name");
          await browser.close();
          errorCode = "{errorCode: '2', msg: 'No client by that name'}";
          resolve(errorCode);
        }
      }
      if (errorCode == undefined) {
        await sleep(6000);
        const errorCount = await page.locator(':text("Connection Error")').count();
        await browser.close();
        if (errorCount > 0) {
          console.log("Connection Error, See guacamole logs for info.");
          errorCode = "{errorCode: '1', msg: 'Can't establish connection (test failed)'}";
          resolve(errorCode);
        } else {
          console.log("Connection Successful");
          errorCode = "{errorCode: '0', msg: 'Connection Successful (test passed)'}";
          resolve(errorCode);
        }
      }

    })();
  });
}

module.exports = { testUserConnection };





