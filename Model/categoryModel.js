const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    is_hidden: {
        type: Boolean,
        default: false
    }
})

const category = mongoose.model("category", categorySchema);

module.exports = category
