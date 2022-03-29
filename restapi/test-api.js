
const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const tests = require('../tests.js');

const app = express();
const port = 3000;

app.use(cors());

// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/api/tests/testConnection', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const name = req.body.name;
    const result = () => {
        tests.testUserConnection(username, password, name)
            .then(errorCode => {
                res.send(errorCode);
            });
    }
    result();
});



app.get('/api/', (req, res) => {
});

app.listen(port, () => console.log(`testing server listening on port ${port}!`));
