const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const validator = require('validator');
const Schema = mongoose.Schema;

const jsonProvider = {
    subscriptionHolder: {
        type: String
    }, // This will be the main account holder's cognitoUsername
    providerType: String, // pharmacist, physician, etc. we can have a dropdown on front end
    providerID: String, // Every Pharmacy and Doctor should have unique providerID
    providerSpecializations: [
        {
            type: Schema.Types.ObjectId,
            ref: 'SpecializationTypes'
        }
    ],
    // providerFirst: {
    //   type: String,
    //   required: [true, 'Provider first name']
    // },
    // providerMiddle: {
    //   type: String
    // },
    // providerLast: {
    //   type: String,
    //   required: [true, 'Provider last name']
    // },
    providerName: {
        type: String
    },
    providerEmail: {
        type: String,
        required: [true, 'Provider email required'],
        validate: {
            validator: function(v) {
                return validator.isEmail(v);
            },
            message: '{VALUE} is not a valid email'
        }
    },
    providerPhone: {
        type: String,
        required: [true, 'Provider Phone required']
    },
    providerFax: {
        type: String
    },
    providerStreetAddress: {
        type: String
    },
    providerSuiteNumber: {
        type: String
    },
    providerCity: {
        type: String
    },
    providerState: {
        type: String
    },
    providerZipcode: {
        type: String
    },
    // coordinate: {
    //   type: {
    //     type: String,
    //     default: "Point"
    //   },
    //   coordinates: {
    //     type: []
    //   }
    // },
    providerCoordinates: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: {
            type: []
        }
    },
    providerPractice: {
        type: String
    },
    providerNPI: {
        type: String,
        required: [true, 'Provider NPI required']
    },
    providerLicense: {
        type: String,
        required: [true, 'Provider License Required']
    },
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
    },
    providerRating: {
        type: String
    },
    specialists: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Specialists'
        }
    ]
};

const providerSchema = new Schema(jsonProvider); //,{autoIndex:false});

// - Manually create compound text index in MongoDB to perform full text search.
//   Using the following index:
providerSchema.index({
    // providerName: 1,
    // providerNPI:1,
    // providerPhone:1,
    // providerEmail: 1,
    // providerLicense:1,
    // providerPractice:1
    // providerCity:1,
    // providerZip:1,
    // providerState:1
    providerName: 'text',
    providerNPI: 'text',
    providerPhone: 'text',
    providerEmail: 'text',
    providerLicense: 'text',
    providerPractice: 'text',
    providerCity: 'text',
    providerZip: 'text',
    providerState: 'text',
    providerCoordinates: '2dsphere'
});

providerSchema.plugin(mongoosePaginate);

// - https://github.com/dherault/serverless-offline/issues/258
function modelAlreadyDeclared() {
    try {
        mongoose.model('Providers'); // it throws an error if the model is still not defined
        return true;
    } catch (e) {
        return false;
    }
}

module.exports =
    modelAlreadyDeclared() === true
        ? mongoose.model('Providers')
        : mongoose.model('Providers', providerSchema);
