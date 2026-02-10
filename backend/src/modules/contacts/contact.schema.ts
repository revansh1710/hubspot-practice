const mongoose = require('mongoose');
const contactSchema = new mongoose.schema({
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    customFields: {
        type: Map,
        of: String
    }
}, { timestamps: true })
module.exports=mongoose.model("Contact",contactSchema)