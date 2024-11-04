const asyncHandler = require("express-async-handler");
const Models = require("../Model/admins");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


exports.create = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone } = req.body;
  const image = req.file ? req.file.filename : null; // Check if file is uploaded
  if (!name || !email || !password || !role || !phone) {
    res.status(400);
    throw new Error("Please add all fields");
  }

  const admin = await Models.create({
    name,
    email,
    password,
    role,
    phone,
    image, // This will be null if no image is uploaded
  });

  if (admin) {
    res.status(201).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      phone: admin.phone,
      image: admin.image,
    });
  } else {
    res.status(400);
    throw new Error("Admin not created");
  }
});

//get Admin

exports.getAdmin = asyncHandler(async (req, res) => {
  const admin = await Models.find();
  if (admin) {
    res.status(200).json(admin);
  } else {
    res.status(400);
    throw new Error("Admin not found");
  }
});

//get Admin by id

exports.getAdminById = asyncHandler(async (req, res) => {
  const admin = await Models.findById(req.params.id);
  if (admin) {
    res.status(200).json(admin);
  } else {
    res.status(400);
    throw new Error("Admin not found");
  }
});

//update Admin

exports.updateAdmin = asyncHandler(async (req, res) => {
  const { email, password, name, phone, role } = req.body;
  const { id } = req.params;
  try {
    const admin = await Models.findById(id);
    if (!admin) {
      console.log("admin not found");
      return res.status(400).json({ message: "Admin not found to update" });
    }
    admin.email = email;
    admin.role = role;
    // admin.password = password;
    admin.name = name;
    admin.phone = phone;
    if (req.file) {
        admin.image = req.file.filename;
    }
    const updateAdmin = await admin.save();
    res.json({ updateAdmin });
  } catch (err) {
    console.log(err, "an error occured in admin updation");
    return res
      .status(500)
      .json({ message: "an error occured in admin updation " });
  }
});

//delete Admin

exports.deleteAdmin = asyncHandler(async (req, res) => {
  const admin = await Models.findByIdAndDelete(req.params.id);
  if (admin) {
    res.status(200).send("success");
  } else {
    res.status(400);
    throw new Error("Admin not found");
  }
});

//login Admin

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  try {
    const superadmin = await Models.findOne({ email: email });
    if (!superadmin) {
      console.log("admin not found with email:", email);
      return res
        .status(400)
        .json({ invalid: true, message: "Invalid email or password" });
    }
    const isPasswordIsMatch = await bcrypt.compare(
      password,
      superadmin.password
    );
    if (superadmin && isPasswordIsMatch) {
      const Admins = {
        name: superadmin.name,
        email: superadmin.email,
        id: superadmin._id,
        role: superadmin.role,
        phone: superadmin.phone,
        image: superadmin.image
      };
      const token = jwt.sign({ email: superadmin.email }, "myjwtsecretkey");
      superadmin.tokens = token;
      await superadmin.save();
      console.log("Signin successful, token generated");
      res.status(200).json({ token: token, Admins: Admins });
    } else {
      console.log("Password mismatch for email:", email);
      return res
        .status(400)
        .json({ invalid: true, message: "Invalid email or password" });
    }
  } catch (err) {
    console.log(err, "signin  failed");
    return res.status(500).json({ err: "Invalid email or password" });
  }
});
