

const { response } = require('express');
const playwright = require('playwright');
const axios = require('axios').default;


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function createTestUsersArray(n) {

    const users = [];

    for (let i = 0; i < n; i++) {
        users[i] = { username: `test-${i}`, password: `test-${i}` };
    }

    return users;
}

function getTokenAndDB() {
    return new Promise(async function (resolve, reject) {
        const reqBody = 'username=guacadmin&password=guacadmin';

        const response = await axios.post(
            'https://test.envops.com/guacamole/api/tokens',
            reqBody,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })


        const token = response.data.authToken
        const dataSource = response.data.dataSource;

        if (!token) {
            reject('Failed to aquire token');
        }
        if (!dataSource) {
            reject('Failed to aquire dataSource');
        }
        resolve({ token, dataSource });
    })
}

function createUsers(users, token, dataSource) {
    return new Promise(async function (resolve, reject) {

        let responseArr = [];

        await Promise.all(users.map(async (user) => {
            const status = await createUser(user, token, dataSource)
            responseArr.push(status)
        }))
        resolve(responseArr)
    })

    function createUser(user, token, dataSource) {
        return new Promise(async function (resolve, reject) {
            const fs = require('fs');

            let rawdata = fs.readFileSync('templates/userTemplate.json');

            let userTemplate = await JSON.parse(rawdata);

            userTemplate.username = user.username
            userTemplate.password = user.password

            const reqBody = JSON.stringify(userTemplate)

            try {
                const response = await axios.post(
                    `https://test.envops.com/guacamole/api/session/data/${dataSource}/users`,
                    reqBody,
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        params: {
                            'token': token
                        }
                    }
                )


                resolve({ user: user.username, status: response.status })


            } catch (error) {
                if (error.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    console.log(error.response.data);
                    console.log(error.response.status);
                    console.log(error.response.headers);
                } else if (error.request) {
                    // The request was made but no response was received
                    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                    // http.ClientRequest in node.js
                    console.log(error.request);
                } else {
                    // Something happened in setting up the request that triggered an Error
                    console.log('Error', error.message);
                }
                console.log(error.config);
                resolve({ user: user.username, status: error.response.status })
            }
        })
    }
}

function deleteUsers(users, token, dataSource) {

    let responseArr = [];

    return new Promise(async function (resolve, reject) {
        await Promise.all(users.map(async (user) => {
            const status = await deleteUser(user, token, dataSource)
            responseArr.push(status)
        }))
        resolve(responseArr)
    })

    function deleteUser(user, token, dataSource) {
        return new Promise(async function (resolve, reject) {
            try {
                const response = await axios.delete(
                    `https://test.envops.com/guacamole/api/session/data/${dataSource}/users/${user.username}`,
                    {
                        params: {
                            'token': token
                        }
                    }
                )


                resolve({ user: user.username, status: response.status })


            } catch (error) {
                if (error.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    console.log(error.response.data);
                    console.log(error.response.status);
                    console.log(error.response.headers);
                } else if (error.request) {
                    // The request was made but no response was received
                    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                    // http.ClientRequest in node.js
                    console.log(error.request);
                } else {
                    // Something happened in setting up the request that triggered an Error
                    console.log('Error', error.message);
                }
                console.log(error.config);
                resolve({ user: user.username, status: error.response.status })
            }
        })
    }
}


function createConnections(connections, token, dataSource) {
    return new Promise(async function (resolve, reject) {

        let responseArr = [];

        await Promise.all(connections.map(async (connection) => {
            const status = await createConnection(connection, token, dataSource)
            responseArr.push(status)
        }))
        resolve(responseArr)

        function createConnection(connection, token, dataSource) {
            return new Promise(async function (resolve, reject) {
                const fs = require('fs');
                let rawdata = fs.readFileSync('templates/connectionTemplate.json');

                let connectionTemplate = await JSON.parse(rawdata);

                connectionTemplate.name = connection.name
                connectionTemplate.protocol = connection.protocol
                connectionTemplate.parameters.hostname = connection.parameters.hostname
                connectionTemplate.parameters.port = connection.parameters.port

                const reqBody = JSON.stringify(connectionTemplate)

                try {
                    const response = await axios.post(
                        `https://test.envops.com/guacamole/api/session/data/${dataSource}/connections`,
                        reqBody,
                        {
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            params: {
                                'token': token
                            }
                        }
                    )

                    resolve({ connection: connection.name, status: response.status, id: response.data.identifier })


                } catch (error) {
                    if (error.response) {
                        // The request was made and the server responded with a status code
                        // that falls out of the range of 2xx
                        console.log(error.response.data);
                        console.log(error.response.status);
                        console.log(error.response.headers);
                    } else if (error.request) {
                        // The request was made but no response was received
                        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                        // http.ClientRequest in node.js
                        console.log(error.request);
                    } else {
                        // Something happened in setting up the request that triggered an Error
                        console.log('Error', error.message);
                    }
                    console.log(error.config);
                    resolve({ connection: connection.name, status: error.response.status })
                }
            })
        }
    })
}

function deleteConnections(connectionIDs, token, dataSource) {

    let responseArr = [];

    return new Promise(async function (resolve, reject) {
        await Promise.all(Object.keys(connectionIDs).map(async (key) => {
            const status = await deleteConnection(connectionIDs[key], token, dataSource)
            responseArr.push(status)
        }))
        resolve(responseArr)
    })

    function deleteConnection(id, token, dataSource) {
        return new Promise(async function (resolve, reject) {
            try {
                const response = await axios.delete(
                    `https://test.envops.com/guacamole/api/session/data/${dataSource}/connections/${id}`,
                    {
                        params: {
                            'token': token
                        }
                    }
                )


                resolve({ connection: id, status: response.status })


            } catch (error) {
                if (error.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    console.log(error.response.data);
                    console.log(error.response.status);
                    console.log(error.response.headers);
                } else if (error.request) {
                    // The request was made but no response was received
                    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                    // http.ClientRequest in node.js
                    console.log(error.request);
                } else {
                    // Something happened in setting up the request that triggered an Error
                    console.log('Error', error.message);
                }
                console.log(error.config);
                resolve({ connection: id, status: error.response.status })
            }
        })
    }
}

function assignConnections(connectionIDs, users, token, dataSource) {
    let responseArr = [];

    return new Promise(async function (resolve, reject) {
        await Promise.all(users.map(async (user) => {
            const status = await assignConnection(connectionIDs, user, token, dataSource)
            responseArr.push(status)
        }))
        resolve(responseArr)
    })
    function assignConnection(connectionIDs, user, token, dataSource) {
        return new Promise(async function (resolve, reject) {
            try {

                const id = connectionIDs[user.username]

                const reqBody = [
                    {
                      "op": "add",
                      "path": `/connectionPermissions/${id}`,
                      "value": "READ"
                    }
                  ]

                const response = await axios.patch(
                    `https://test.envops.com/guacamole/api/session/data/${dataSource}/users/${user.username}/permissions`,
                    reqBody,
                    {
                        headers:{
                            'Content-Type': 'application/json'
                        },  
                        params: {
                            'token': token
                        }
                    }
                )
                resolve({ connection: user.username, user: user.username, status: response.status })
            } catch (error) {
                if (error.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    console.log(error.response.data);
                    console.log(error.response.status);
                    console.log(error.response.headers);
                } else if (error.request) {
                    // The request was made but no response was received
                    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                    // http.ClientRequest in node.js
                    console.log(error.request);
                } else {
                    // Something happened in setting up the request that triggered an Error
                    console.log('Error', error.message);
                }
                console.log(error.config);
                resolve({connection: user.username, user: user.username, status: error.response.status })
            }
        })
    }
}

function connect_n_users(n) {
    return new Promise(async function (resolve, reject) {
        if (!n) {
            reject('Provide paramater for user amount.');
        }

        const users = createTestUsersArray(n);

        const data = await getTokenAndDB();
        const token = data.token;
        const dataSource = data.dataSource;

        const createUsersResult = await createUsers(users, token, dataSource);

        console.log('Create users response list:')
        createUsersResult.forEach(result => {
            console.log(`User: ${result.user}, Status: ${result.status}`)
        });

        //TODO get connectionParams

        const tempConnectionParams = [
            { name: 'test-0', protocol: 'rdp', parameters: { hostname: 'chrome-pg', port: '3389' } },
            { name: 'test-1', protocol: 'rdp', parameters: { hostname: 'chrome-pg', port: '3389' } },
            { name: 'test-2', protocol: 'rdp', parameters: { hostname: 'chrome-pg', port: '3389' } },
        ]

        console.log('\n')

        const createConnectionResult = await createConnections(tempConnectionParams, token, dataSource);

        const connectionIDs = {}

        console.log('Create connections response list:')
        createConnectionResult.forEach(result => {
            console.log(`Connection: ${result.connection}, Status: ${result.status} ID: ${result.id}`)

            connectionIDs[result.connection] = result.id
        });

        //TODO assign users to connections

        console.log('\n')

        const assignConnectionsResult = await assignConnections(connectionIDs, users, token, dataSource);

        console.log('Assign connections response list:')
        assignConnectionsResult.forEach(result => {
            console.log(`Connection: ${result.connection}, User: ${result.user} Status: ${result.status}`)
        });
        //TODO connect users to connections
        //TODO hang X seconds
        //TODO close connections

        console.log('\n')

        const deleteConnectionsResult = await deleteConnections(connectionIDs, token, dataSource);

        console.log('Delete connections response list:')
        deleteConnectionsResult.forEach(result => {
            console.log(`Connection: ${result.connection}, Status: ${result.status}`)
        });


        console.log('\n')

        const deleteUsersResult = await deleteUsers(users, token, dataSource)

        console.log('Delete users response list:')
        deleteUsersResult.forEach(result => {
            console.log(`User: ${result.user}, Status: ${result.status}`)
        });

        resolve()
    })
}

connect_n_users(3)

module.exports = { connect_n_users };