const mongoose = require('mongoose')

const MessagesSchema = new mongoose.Schema({
    text: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
    time:
    {
        type: mongoose.Schema.Types.Date,
        default: Date.now,
    },
    user: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
    room: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
})

MessagesSchema.pre('save', function (next) {
    this.room = this.room.toLowerCase()
    this.user = this.user.toLowerCase()

    next()
})


module.exports = mongoose.model('messages', MessagesSchema)