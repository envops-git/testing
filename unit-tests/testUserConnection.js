const playwright = require('playwright');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function testUserConnection(username, password, connectionName) {
    return new Promise(function (resolve, reject) {

        let exitCode;

        (async () => {
            const browser = await playwright.chromium.launch({ headless: false });
            const context = await browser.newContext();
            const page = await context.newPage();

            await page.goto('https://test.envops.com/guacamole/#/');
            await page.waitForSelector('.version > .app-name');
            await page.fill('.ng-scope > [type="text"]', username);
            await page.fill('.ng-scope > [type="password"]', password);
            await page.click('.buttons >> [type="submit"]');
            await sleep(500);
            const count = await page.locator(':text("Invalid Login")').count();
            if (count) {
                console.log("Invalid Login Credentials");
                await browser.close();
                exitCode = "{\"exitCode\": \"3\", \"msg\": \"Invalid Login Credentials\"}";
                resolve(exitCode);
            }
            try {
                await page.click(`:text("${connectionName}")`, {
                    timeout: 8000
                });
            } catch (error) {
                if (error instanceof playwright.errors.TimeoutError) {
                    console.log("No connection by that name");
                    await browser.close();
                    exitCode = "{\"exitCode\": \"2\", \"msg\": \"No client by that name (didn't test)\"}";
                    resolve(exitCode);
                }
            }
            if (exitCode == undefined) {
                await sleep(6000);
                const count = await page.locator(':text("Connection Error")').count();
                await browser.close();
                if (count > 0) {
                    console.log("Connection Error, See guacamole logs for info.");
                    exitCode = "{\"exitCode\": \"1\", \"msg\": \"Connection failed (test failed)\"}";
                    resolve(exitCode);
                } else {
                    console.log("Connection Successful");
                    exitCode = "{\"exitCode\": \"0\", \"msg\": \"Connection successful (test passed)\"}";
                    resolve(exitCode);
                }
            }
        })();
    });
}
module.exports = { testUserConnection };