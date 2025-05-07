const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { sequelize } = require("../config/db");
const User = sequelize.define(
  "User",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: false,
      validate: { isEmail: true },
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { is: /^[\d\+\-\.\(\)\/\s]*$/ },
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM(
        "admin",
        "hydrogeologist",
        "engineer",
        "driller",
        "contractor",
        "drilling_company",
        "user"
      ),
      allowNull: false,
      defaultValue: "user",
    },
    specialization: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    licenseType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    licenseBody: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    licenseNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userLGA: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    passwordResetToken: {
      type: DataTypes.STRING,
    },
    passwordResetExpires: {
      type: DataTypes.DATE,
    },
    passwordChangedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    timestamps: true,
    updatedAt: false,
    hooks: {
      beforeSave: async (user) => {
        if (user.changed("password")) {
          user.password = await bcrypt.hash(user.password, 12);
          user.passwordChangedAt = new Date(Date.now() - 1000);
        }
      },
    },
  }
);

User.prototype.correctPassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

User.prototype.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

User.prototype.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

module.exports = User;
