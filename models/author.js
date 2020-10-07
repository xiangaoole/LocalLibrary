const mongoose = require('mongoose');
const moment = require('moment');

const { Schema } = mongoose;

const AuthorSchema = new Schema({
  first_name: { type: String, required: true, maxlength: 100 },
  family_name: { type: String, required: true, maxlength: 100 },
  date_of_birth: { type: Date },
  date_of_death: { type: Date },
});

// Virtual for author's full name
AuthorSchema.virtual('name').get(function () {
  // To avoid errors
  let fullname = '';
  if (this.first_name && this.family_name) {
    fullname = `${this.first_name} ${this.family_name}`;
  } else {
    fullname = '';
  }

  return fullname;
});

// Virtual for author's lifespan
AuthorSchema.virtual('lifespan').get(function () {
  const dateOfBirthFormatted = this.date_of_birth
    ? moment(this.date_of_birth).format('MMMM Do, YYYY')
    : '';
  const deteOfDeathFormatted = this.date_of_death
    ? moment(this.date_of_death).format('MMMM Do, YYYY')
    : '';
  return dateOfBirthFormatted || deteOfDeathFormatted
    ? `${dateOfBirthFormatted} - ${deteOfDeathFormatted}`
    : '';
});

// Virtual for author's URL
AuthorSchema.virtual('url').get(function () {
  return `/catalog/author/${this._id}`;
});

module.exports = mongoose.model('Author', AuthorSchema);
