const mongoose = require('mongoose')

const RoomSchema = new mongoose.Schema({
    name: {
        type: mongoose.Schema.Types.String,
        unique: true,
        required: true,
    },
    namespace:
    {
        type: mongoose.Schema.Types.String,
        unique: true,
        required: true,
    },
    isPrivate: {
        type: mongoose.Schema.Types.Boolean,
        default: false
    },
})

RoomSchema.pre('save', function (next) {
    this.name = this.name.toLowerCase()

    next()
})

module.exports = mongoose.model('rooms', RoomSchema)