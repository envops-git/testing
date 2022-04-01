const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const { testUserConnection } = require('./unit-tests/testUserConnection');

const app = express();
const port = 3000;

app.use(cors());

// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/api/tests/testConnection', (req, res) => {

    console.log("POST to testConnection");

    const username = req.body.username;
    const password = req.body.password;
    const connectionName = req.body.name;
    const result = () => {
        testUserConnection(username, password, connectionName)
            .then(result => {
                res.send(result);
            });
    }
    result();
});

app.listen(port, () => console.log(`testing server listening on port ${port}!`));