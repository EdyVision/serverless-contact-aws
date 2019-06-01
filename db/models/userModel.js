//@flow
'use strict';

const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;

// Does it make sense to just save the cognitoUser and call Cognito to retrieve user details.
// The benefit is we don't have to keep track of changes in a separate user DB where things could get out of sync
// On the flipside I wonder if it will affect performance because we have to call Cognito every time
// We need user info (which may not be a problem...idk)
var jsonUser = {
    _id: {
        type: Schema.Types.ObjectId,
        auto: true
    },
    cognitoUser: {
        type: String
    }
};

var userSchema = new Schema(jsonUser);

userSchema.plugin(mongoosePaginate);

function modelAlreadyDeclared() {
    try {
        mongoose.model('Users'); // it throws an error if the model is still not defined
        return true;
    } catch (e) {
        return false;
    }
}

module.exports = modelAlreadyDeclared()
    ? mongoose.model('Users')
    : mongoose.model('Users', userSchema);
