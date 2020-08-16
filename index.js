const express = require('express')
const credentials = require("./creds");
const app = express()
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const cors = require('cors');
const applicationsRoute = require("./routes/applications")
const moment = require('moment'); // require

app.use(cors({
    origin: ['https://inceptioncloud.net', 'null']
}))
app.use(bodyParser.json())

// Routes
app.get('/', (req, res) => {
    res.redirect('https://inceptioncloud.net/de/apply/')
})

app.use('/applications', applicationsRoute)

// Connect to database
mongoose.connect(`mongodb://${credentials.db.username}:${credentials.db.password}@45.85.219.34:27017/dragonfly`, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
})
    .then(() => console.log('DB Connected!'))
    .catch(err => {
        console.log(`DB Connection Error: ${err.message}`);
    });

app.listen(4000, console.log('Listening on Port 4000'))
