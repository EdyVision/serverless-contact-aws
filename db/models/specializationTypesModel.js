const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;

const jsonSpecializationTypes = {
    _id: {
        type: Schema.Types.ObjectId,
        auto: true
    },
    typeName: String,
    typeCode: String,
    typeDescription: String,
    requirements: [
        {
            requirement: String,
            description: String
        }
    ],
    source: String // - source of the specilization: URL, book, made up etc...
};

const specializationTypesSchema = new Schema(jsonSpecializationTypes);

specializationTypesSchema.plugin(mongoosePaginate);

// - https://github.com/dherault/serverless-offline/issues/258
function modelAlreadyDeclared() {
    try {
        mongoose.model('SpecializationTypes'); // it throws an error if the model is still not defined
        return true;
    } catch (e) {
        return false;
    }
}

module.exports =
    modelAlreadyDeclared() === true
        ? mongoose.model('SpecializationTypes')
        : mongoose.model('SpecializationTypes', specializationTypesSchema);
