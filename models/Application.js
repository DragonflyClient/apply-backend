const mongoose = require('mongoose')

const CandidatureSchema = mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    name: {
        type: String,
        require: true
    },
    nickname: {
        type: String,
        required: false
    },
    discordName: {
        type: String,
        required: true
    },
    position: String,
    message: {
        type: String,
        required: true
    },
    date: {
        type: Number,
        required: true,
    }
})

module.exports = mongoose.model('Candidature', CandidatureSchema, "applications")