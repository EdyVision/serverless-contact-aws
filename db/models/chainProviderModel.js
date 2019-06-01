const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const validator = require('validator');
const Schema = mongoose.Schema;

const jsonChainProvider = {
    chainProviderName: String,
    chainProviderSubscriptionHolder: String, // CognitoUsername of the subscription holder
    chainProviderType: String, // could be pharmacy can be physician or whatever
    // The following is the data for the provider chain's main office
    chainProviderNPI: {
        type: String,
        required: [true, 'Provider NPI required']
    },
    chainProviderPhone: {
        type: String,
        required: [true, 'Provider Phone required']
    },
    chainProviderFax: {
        type: String
    },
    chainProviderEmail: {
        type: String,
        required: [true, 'Chain Provider email required'],
        validate: {
            validator: function(v) {
                return validator.isEmail(v);
            },
            message: '{VALUE} is not a valid email'
        }
    },
    chainProviderStreetAddress: {
        type: String
    },
    chainProviderSuiteNumber: {
        type: String
    },
    chainProviderCity: {
        type: String
    },
    chainProviderState: {
        type: String
    },
    chainProviderZipcode: {
        type: String
    },
    // The following references individual location subscriptions
    chainProviderLocations: [
        {
            type: Schema.Types.ObjectId,
            ref: 'providers'
        }
    ],
    chainProviderRating: {
        type: String
    },
    chainProviderSocial: [
        {
            description: String,
            address: String // - can be your url, twitter handle or address etc...
        }
    ]
};

const chainProviderSchema = new Schema(jsonChainProvider);

chainProviderSchema.plugin(mongoosePaginate);

// - https://github.com/dherault/serverless-offline/issues/258
function modelAlreadyDeclared() {
    try {
        mongoose.model('ChainProviders'); // it throws an error if the model is still not defined
        return true;
    } catch (e) {
        return false;
    }
}
module.exports =
    modelAlreadyDeclared() === true
        ? mongoose.model('ChainProviders')
        : mongoose.model('ChainProviders', chainProviderSchema);
