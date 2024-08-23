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
    dateOfBirth: { type: Date  },
    age: { type: Number },
    password:{type:String},
    gender: { type: String  },
    maritalStatus: { type: String  },
    academicQualification: { type: String  },
    mobileNumber: { type: Number  },
    parentsMobileNumber: { type: Number  },
    email: { type: String  },
    courseName: {  type: String},
    joinDate: { type: Date  },
    courseFee: { type: Number  },
    guardianId: { type: String  },
    studentId: { type: String  },
    token:{type: String}
});

studentSchema.pre('save', async function(next) {
    const student = this;
    
    if (student.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        student.password = await bcrypt.hash(student.password, salt);
    }

    // Convert name and guardianName to uppercase
    if (student.isModified('name')) {
        student.name = student.name.toUpperCase();
    }

    if (student.isModified('guardianName')) {
        student.guardianName = student.guardianName.toUpperCase();
    }

    // Format fullAddress: First letter capitalized, rest lowercased
    if (student.isModified('fullAddress')) {
        student.fullAddress = student.fullAddress.split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
    }

    // Convert email to lowercase
    if (student.isModified('email')) {
        student.email = student.email.toLowerCase();
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
