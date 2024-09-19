const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const studentSchema = new mongoose.Schema({
    admissionDate: { type: Date  },
    invoiceNumber: { type: String },
    image: { type: String  },
    name: { type: String  },
    fullAddress: { type: String},
    state: { type: String  },
    pinCode: { type: String  },
    bloodGroup: { type: String  },
    guardianName: { type: String  },
    guardianRelation: { type: String  },
    dateOfBirth: { type: Date },
    age: { type: Number },
    password:{type:String},
    gender: { type: String  },
    maritalStatus: { type: String  },
    academicQualification: { type: String  },
    mobileNumber: { type: Number  },
    parentsMobileNumber: { type: String ,default: null,},
    email: { type: String  },
    courseName: {type: String },
    joinDate: { type: Date  },
    courseFee: { type: Number  },
    guardianId: { type: String  },
    studentId: { type: String  },
    token:{type: String},
    active:{type:Boolean, default:true},
    deactivationReason: { type: String, default: null } 
});
studentSchema.pre('save', async function(next) {
    const student = this;
    
    if (student.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        student.password = await bcrypt.hash(student.password, salt);
    }
    next();
});

// Method to generate token
studentSchema.methods.generateAuthToken = function() {
    const student = this;
    const token = jwt.sign({ _id: student._id.toString() }, 'myjwtsecretkey');
    student.token = token;
    return token;
};

module.exports = mongoose.model('Student', studentSchema);
