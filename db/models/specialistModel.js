const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const validator = require('validator');
const Schema = mongoose.Schema;

const jsonSpecialist = {
    subscriptionHolder: {
        type: String
    }, // This will be the main account holder's cognitoUsername
    specialistSpecializations: [
        {
            type: Schema.Types.ObjectId,
            ref: 'SpecializationTypes'
            // required: [true, 'At least 1 specialization is required']
        }
    ],
    specialistFirst: {
        type: String,
        required: [true, 'Provide first name']
    },
    specialistMiddle: {
        type: String
    },
    specialistLast: {
        type: String,
        required: [true, 'Provide last name']
    },
    specialistEmail: {
        type: String,
        required: [true, 'User email required'],
        validate: {
            validator: function(v) {
                return validator.isEmail(v);
            },
            message: '{VALUE} is not a valid email'
        },
        unique: [true, 'Email already exists']
    },
    specialistPhone: {
        type: String,
        required: [true, 'Specialist Phone required']
    },
    specialistFax: {
        type: String
    },
    specialistStreetAddress: {
        type: String
    },
    specialistSuiteNumber: {
        type: String
    },
    specialistCity: {
        type: String
    },
    specialistState: {
        type: String
    },
    specialistZipcode: {
        type: String
    },
    specialistCoordinates: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: {
            type: []
        }
    },
    specialistPractice: {
        type: String
    },
    specialistNPI: {
        type: String,
        required: [true, 'Specialist NPI required']
    },
    specialistRating: {
        type: String
    },
    specialistLicense: {
        type: String,
        required: [true, 'Specialist License Required']
    },
    specialistBio: {
        type: String
    },
    specialistImageKey: {
        type: String
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
    }
};

const specialistSchema = new Schema(jsonSpecialist);

specialistSchema.index({
    specialistCoordinates: '2dsphere'
});

specialistSchema.plugin(mongoosePaginate);

// - https://github.com/dherault/serverless-offline/issues/258
function modelAlreadyDeclared() {
    try {
        mongoose.model('Specialists'); // it throws an error if the model is still not defined
        return true;
    } catch (e) {
        return false;
    }
}

module.exports =
    modelAlreadyDeclared() === true
        ? mongoose.model('Specialists')
        : mongoose.model('Specialists', specialistSchema);
