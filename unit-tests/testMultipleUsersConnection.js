const playwright = require('playwright');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function connectUser(user, browser) {
    return new Promise(function (resolve, reject) {
        (async () => {
            const context = await browser.newContext();
            const page = await context.newPage();

            await page.goto('https://test.envops.com/guacamole/#/');
            await page.waitForSelector('.version > .app-name');
            await page.fill('.ng-scope > [type="text"]', user.username);
            await page.fill('.ng-scope > [type="password"]', user.password);
            await page.click('.buttons >> [type="submit"]');
            await sleep(1000);

            const isLogin = await page.locator(':text("Invalid Login")', { timeout: 3000}).count();
            
            if (isLogin) {
                console.log(`${user.username} login failed.`);
                resolve(`${user.username} login failed.`);
            } else {
                console.log(`${user.username} logged in.`);
                resolve(`${user.username} logged in`);
            }

            await sleep(3000);
            await browser.close();
        })()
    })
}

async function testMultipleUsersConnection(users) {
    const browser = await playwright.chromium.launch({ headless: false });

    await Promise.all(users.map(user => {
        connectUser(user, browser)
    }))
}


function createUsersArr(length){

    const users = []

    for(let i = 1; i <= length; i++){
        users[i] = { username: `test-${i}`, password: `test-${i}`}
    }
    
    return users
}


const users = createUsersArr(5)

testMultipleUsersConnection(users);


module.exports = { testMultipleUsersConnection };