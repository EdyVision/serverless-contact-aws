//@flow
'use strict';

const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;

var patientRequestJSON = {
    prescriptionID: {
        type: Schema.Types.ObjectId,
        ref: 'Prescriptions'
    },
    // This how we track who sent the request and how we query
    // patient PII
    cognitoUser: {
        type: String
    },
    drugName: {
        type: String
    },
    drugQty: {
        type: String
    },
    rxNumber: {
        type: String
    },
    healthContactID: {
        type: String
    },
    healthContactType: {
        type: String,
        enum: ['specialist', 'pharmacy']
    },
    patientRequestType: {
        type: String,
        enum: ['refill', 'visit']
    },
    patientRequestNote: {
        type: String
    },
    patientRequestStatus: {
        type: String,
        enum: ['new', 'acknowledged', 'processed', 'rejected', 'closed']
    },
    reviewRating: {
        type: String
    },
    reviewComment: {
        type: String
    },
    patientComment: {
        type: String
    },
    healthContactComment: {
        type: String
    },
    created: {
        type: Date,
        default: Date.now
    },
    processed: {
        type: Date
    }
};

var patientRequestSchema = new Schema(patientRequestJSON);

patientRequestSchema.plugin(mongoosePaginate);

function modelAlreadyDeclared() {
    try {
        mongoose.model('PatientRequests'); // it throws an error if the model is still not defined
        return true;
    } catch (e) {
        return false;
    }
}

module.exports =
    modelAlreadyDeclared() === true
        ? mongoose.model('PatientRequests')
        : mongoose.model('PatientRequests', patientRequestSchema);
