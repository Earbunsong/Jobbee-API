const mongoose = require('mongoose');
const validation = require('validator');
const slugify = require('slugify');
const geoCoder = require('../utils/geocoder');

const jobScheme = new mongoose.Schema({
    title : {
        type: String,
        require : [true, 'Please be accept and enter your job.'],
        trim: true,
        maxlength : [100,'job title can not exceed 100 characters'] 
    },
    slug : String,
    description: {
        type: String,
        require : [true, 'Please enter your job description.'],
        maxlength : [1000,'job title can not exceed 1000 characters'] 

    },
    email : {
        type : String,
        validation : [validation.isEmail, 'Please at email address.']
    },
    address : {
        type : String,
        require : [true, 'Please enter your address.']
    },
    location : {
        type : {
            type : String,
            enum : ['Point']
        },
        coordinates : {
            type : [Number],
            index : '2dsphere'
        },
        formattedAddress : String,
        city : String,
        state : String,
        zipcode : String,
        country : String
    },
    company : {
        type : String,
        require : [true, 'Please at your company name.']
    },
    industry : {
        type : [String],
        require : true,
        enum : {    
            values : [
                'Business',
                'Information Technology',
                'Banking',
                'Education/Training',
                'Telecommunication',
                'Others'
            ],
            message : 'Please select correct options for industry'
        }
    },
    jobType : {
        type : String,
        require : [true,'please enter your job type'],
        enum : {
            values : [
                'Permanent',
                'Temporary',
                'Internship'
            ],
            message : 'Please select correct options for jobType'
        }
    },
    minEducation : {
        type : String,
        require : [true,'please enter minEducation '],
        enum : {
            values : [
                'Bachelors',
                'Masters',
                'Phd'
            ],
            message : 'Please select correct options for minEducation'
        }
    },
    positions : {
        type : Number,
        default : 1
    },
    experince : {
        type : String,
        require : [true,'please enter your experince '],
        enum : {
            values : [
                'No experince',
                '1 year - 2 year',
                '2 year - 5 year',
                '5 year+'
            ],
            message : 'Please select correct option in the box.'
        }
    },
    salary: {
        type : Number,
        require : [true, 'Please select expected salary for this job.']
    },
    postingDate : {
        type : Date,
        default : Date.now
    },
    lastDate : {
        type : Date,
        default : new Date().setDate(new Date().getDate() + 7)
    },
    applicantsApplied : {
        type : [Object],
        select : false
    },
    user : {
        type : mongoose.Schema.ObjectId,
        ref : 'User',
        required : true   
    }
});

//create Job Slug before saving 
jobScheme.pre('save',function(next){
    //Create slug before saving to DB
    this.slug = slugify(this.title,{lower: true});

    next();

    //setting up location
    jobScheme.pre('save',async function(next){
        const loc = await geoCoder.geoCoder(this.address);

        this.location ={
            type : 'Point',
            coordinates : [loc[0].longitude,loc[0].longitude],
            formattedAddress : loc[0].formattedAddress,
            city : loc[0].city,
            state : loc[0].state,
            zipcode : loc[0].zipcode,
            country : loc[0].countrycode
        }
    })
})

module.exports = mongoose.model('Job',jobScheme);