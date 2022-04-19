const playwright = require('playwright');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function testUserConnections(username, password, maxConnections) {
    return new Promise(function (resolve, reject) {

        let exitCode;

        (async () => {
            const browser = await playwright.chromium.launch({ headless: false, timeout: 3000 });
            const context = await browser.newContext();
            const page = await context.newPage();

            await page.goto('https://test.envops.com/guacamole/#/');
            await page.waitForSelector('.version > .app-name');
            await page.fill('.ng-scope > [type="text"]', username);
            await page.fill('.ng-scope > [type="password"]', password);
            await page.click('.buttons >> [type="submit"]');
            await sleep(500);
            const isLogin = await page.locator(':text("Invalid Login")').count();
            if (isLogin) {
                console.log("Invalid Login Credentials");
                await browser.close();
                exitCode = "{\"exitCode\": \"3\", \"msg\": \"Invalid Login Credentials\"}";
                resolve(exitCode);
            }

            const connectionsLocator = page.locator('.all-connections')
            await connectionsLocator.waitFor()

            const connections = (await connectionsLocator.allInnerTexts()).toString().split('\n ')
            connections[0] = connections[0].substring(1)

            let pages = {}

            for (let i = 0; i < connections.length && i < maxConnections; i++) {
                pages[i] = await context.newPage()
            }

            await Promise.all(Object.keys(pages).map(i =>
                pages[i].goto('https://test.envops.com/guacamole/#/')
            ))

            await Promise.all(Object.keys(pages).map(i => {
                pages[i].click(`:text("${connections[i]}")`)
            }))

            for (let i = 0; i < connections.length && i < maxConnections; i++) {

                try {
                    const isErrorLocator = pages[i].locator(':text("Connection Error")')
                    await isErrorLocator.waitFor({ timeout: 3000})
                    const isError = await isErrorLocator.count()
                    if (isError) {
                        console.log(`${connections[i]} connection error`)
                    }
                } catch (error) {
                    if (error instanceof playwright.errors.TimeoutError) {
                        console.log(`${connections[i]} connected successfully`)
                    }
                }
            }

            await sleep(30000)

            await Promise.all(Object.keys(pages).map(i =>
                pages[i].close()
            ))

            await browser.close();
        })();
    })
}

module.exports = { testUserConnections };