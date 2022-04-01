const playwright = require('playwright');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function testUserConnection(username, password, connectionName) {
    return new Promise(function (resolve, reject) {

        let exitCode;

        (async () => {
            const browser = await playwright.chromium.launch({ headless: true });
            const context = await browser.newContext();
            const page = await context.newPage();

            await page.goto('https://test.envops.com/guacamole/#/');
            await page.waitForSelector('.version > .app-name');
            await page.fill('.ng-scope > [type="text"]', username);
            await page.fill('.ng-scope > [type="password"]', password);
            await page.click('.buttons >> [type="submit"]');
            try {
                await page.click(`:text("${connectionName}")`, {
                    timeout: 10000
                });
            } catch (error) {
                if (error instanceof playwright.errors.TimeoutError) {
                    console.log("No connection by that name");
                    await browser.close();
                    exitCode = "{\"errorCode\": \"2\", \"msg\": \"No client by that name (didn't test)\"}";
                    resolve(exitCode);
                }
            }
            if (exitCode == undefined) {
                await sleep(6000);
                const count = await page.locator(':text("Connection Error")').count();
                await browser.close();
                if (count > 0) {
                    console.log("Connection Error, See guacamole logs for info.");
                    exitCode = "{\"errorCode\": \"1\", \"msg\": \"Connection failed (test failed)\"}";
                    resolve(exitCode);
                } else {
                    console.log("Connection Successful");
                    exitCode = "{\"errorCode\": \"0\", \"msg\": \"Connection successful (test passed)\"}";
                    resolve(exitCode);
                }
            }
        })();
    });
}

module.exports = { testUserConnection };