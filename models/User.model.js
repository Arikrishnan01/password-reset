const mongoose = require("mongoose");

const CRMusersSchema = mongoose.Schema({
    Name:{
        type: String,
        required: true,
    },
    email:
    {
        type: String,
        required: true,
    },
    password:
    {
        type: String,
        required: true,
    },
    Contact:
    {
        type: Number,
        required: true,
    },
    Role:
    {
        type: String,
        required: true,
    },
    Company:
    {
        type: String,
        required: true,
    }

});

const usermodel= new mongoose.model("crmusers", CRMusersSchema);


module.exports = usermodel;