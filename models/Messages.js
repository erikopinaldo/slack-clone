const mongoose = require('mongoose')

const MessagesSchema = new mongoose.Schema({
    text: {
        type: mongoose.Schema.Types.String,
        unique: true,
        required: true,
    },
    time:
    {
        type: mongoose.Schema.Types.Date,
        unique: true,
        required: true,
    },
    username: {
        type: mongoose.Schema.Types.String,
        required: true,
        unique: true,
    },
    room: {
        type: mongoose.Schema.Types.String,
        required: true,
        unique: true,
    },
})


module.exports = mongoose.model('messages', MessagesSchema)