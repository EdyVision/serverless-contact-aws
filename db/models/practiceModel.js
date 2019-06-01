const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;

var jsonPractice = {
    _id: {
        type: Schema.Types.ObjectId,
        auto: true
    },
    practiceName: String,
    location: [
        {
            subname: String,
            address: String,
            city: String,
            state: String,
            postalcode: String,
            phones: [
                {
                    description: String,
                    number: String
                }
            ],
            emails: [
                {
                    description: String,
                    email: String
                }
            ]
        }
    ],
    social: [
        {
            description: String,
            address: String, // - can be your url, twitter handle or address etc...
            rating: String
        }
    ],
    licenses: [
        {
            name: String,
            address: String,
            city: String,
            state: String,
            postalcode: String,
            licenseNumber: String,
            department: String
            // documentPaths: [{
            //   path: String
            // }] // - s3 bucket paths or urls to documents.
        }
    ],
    subscriptionStart: {
        type: Date,
        default: Date.now,
        auto: true
    },
    subscriptionExpiry: {
        type: Date
    },
    subscriptionActive: {
        type: Boolean
    }
};

const practiceSchema = new Schema(jsonPractice);

practiceSchema.plugin(mongoosePaginate);

// - https://github.com/dherault/serverless-offline/issues/258
function modelAlreadyDeclared() {
    try {
        mongoose.model('Practices'); // it throws an error if the model is still not defined
        return true;
    } catch (e) {
        return false;
    }
}
module.exports =
    modelAlreadyDeclared() === true
        ? mongoose.model('Practices')
        : mongoose.model('Practices', practiceSchema);
