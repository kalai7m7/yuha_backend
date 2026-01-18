import bcrypt from "bcryptjs";

bcrypt.hash("Admin@123", 10).then(console.log);