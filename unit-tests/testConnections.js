const playwright = require('playwright');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function connectUser(user, seconds, browser) {
    return new Promise(async function (resolve, reject) {
        const context = await browser.newContext();
        const page = await context.newPage();

        await page.goto('https://test.envops.com/guacamole/#/');
        await page.waitForSelector('.version > .app-name');
        await page.fill('.ng-scope > [type="text"]', user.username);
        await page.fill('.ng-scope > [type="password"]', user.password);
        await page.click('.buttons >> [type="submit"]');
        await sleep(1000);

        const isLogin = await page.locator(':text("Invalid Login")', { timeout: 3000 }).count();

        if (isLogin) {
            resolve(`${user.username} login failed.`);
        } else {
            seconds = seconds * 1000;

            await sleep(seconds);
            await browser.close();
            resolve(`${user.username} was tested successfully`);
        }
    })
}

async function testConnections(users, seconds) {
    return new Promise(async function (resolve, reject) {

        responseArr = []

        const browser = await playwright.chromium.launch({ headless: false });

        await Promise.all(users.map(async user => {
            const status = await connectUser(user, seconds, browser);
            responseArr.push(status);
        }))

        resolve(responseArr)
    })
}


function createUsersArr(length) {

    const users = []

    for (let i = 1; i <= length; i++) {
        users[i] = { username: `test-${i}`, password: `test-${i}` }
    }

    return users
}

module.exports = { testConnections };