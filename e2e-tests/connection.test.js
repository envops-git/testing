const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
    await page.goto('http://ec2-54-87-66-8.compute-1.amazonaws.com:32000/guacamole/#/');
});

test.describe('Test connection to guacamole', () => {

    test.use({ ignoreHTTPSErrors: true });

    test('testing connection', async ({ page, browserName }) => {

        const username = 'admin';
        const password = 'admin';
        const connectionName = 'chrome-pg-spo';


        await page.waitForSelector('.version > .app-name');
        await page.fill('.ng-scope > [type="text"]', username);
        await page.fill('.ng-scope > [type="password"]', password);
        await page.click('.buttons >> [type="submit"]');
        // await page.screenshot({ path: `homePage-${browserName}.png` });
        await page.click(`:text("${connectionName}")`, {
            timeout: 10000
        });
        await sleep(5000);
        const count = await page.locator(':text("Connection Error")').count();
        if (count > 0) {
            throw 'Connection Failed';
        }
        // await page.screenshot({ path: `connectionPage-${browserName}.png` });
    });
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}