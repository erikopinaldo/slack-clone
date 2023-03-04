const mongoose = require('mongoose')

const NamespaceSchema = new mongoose.Schema({
    name: {
        type: mongoose.Schema.Types.String,
        unique: true,
        required: true,
    },
    endpoint:
    {
        type: mongoose.Schema.Types.String,
        unique: true,
        required: true,
    },
    img: {
        type: mongoose.Schema.Types.String,
        unique: true,
    },
    rooms: {
        type: [String],
        default: ['general']
    },
})

NamespaceSchema.pre('save', function (next) {
    this.name = this.name.toLowerCase()

    next()
})

module.exports = mongoose.model('namespaces', NamespaceSchema)