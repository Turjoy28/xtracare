var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// utils/AppError.js
var require_AppError = __commonJS({
  "utils/AppError.js"(exports2, module2) {
    var AppError = class extends Error {
      constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
      }
    };
    module2.exports = AppError;
  }
});

// middlewares/globalErrorMiddleware.js
var require_globalErrorMiddleware = __commonJS({
  "middlewares/globalErrorMiddleware.js"(exports2, module2) {
    var multer = require("multer");
    var AppError = require_AppError();
    var handleCastErrorDB = (err) => {
      let message;
      if (err.valueType === "Object") {
        message = "Object value is not allowed, Please use proper value!";
      } else {
        message = `Invalid ${err.path}: ${err.value}.`;
      }
      return new AppError(message, 400);
    };
    var handleDuplicateFieldsDB = (err) => {
      const field = Object.keys(err.keyPattern).join(" ");
      const capitalizeField = field.charAt(0).toUpperCase() + field.slice(1).toLocaleLowerCase();
      const message = `${capitalizeField} already exist, Please use another ${field}.`;
      return new AppError(message, 409);
    };
    var handleValidationErrorDB = (err) => {
      const errors = Object.values(err.errors).map((item) => item.message).join(", ");
      const message = `Validation failed, ${errors}.`;
      return new AppError(message, 400);
    };
    var handleParallelExcludeIncludeDB = () => {
      const message = "Cannot perform exclusion & inclusion at the same time.";
      return new AppError(message, 409);
    };
    var handleJWTError = () => {
      const message = "Invalid token!, Please try again later.";
      return new AppError(message, 401);
    };
    var handleJWTExpiration = () => {
      const message = "Token has been expired! Try again later.";
      return new AppError(message, 401);
    };
    var handleMulterError = (err) => {
      let message;
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        message = "Too many files were uploaded";
      } else if (err.code === "LIMIT_FILE_SIZE") {
        message = "File size is too large";
      } else if (err.code === "LIMIT_FILE_COUNT") {
        message = "Too many files uploaded";
      } else {
        message = "File upload error";
      }
      return new AppError(message, 400);
    };
    var sendErrorProd = (err, req, res) => {
      if (req.originalUrl.startsWith("/api")) {
        if (err.isOperational) {
          return res.status(err.statusCode).json({
            status: err.status,
            message: err.message
          });
        }
        console.error("ERROR --> ", err);
        return res.status(500).json({
          status: "error",
          message: "Something went wrong, Try again!"
        });
      }
    };
    var globalErrorHandler = (err, req, res, next) => {
      err.statusCode = err.statusCode || 500;
      err.status = err.status || "error";
      if (err.name === "CastError") err = handleCastErrorDB(err);
      if (err.code === 11e3) err = handleDuplicateFieldsDB(err);
      if (err.name === "ValidationError") err = handleValidationErrorDB(err);
      if (err.code === 31254 || err.code === 31253) {
        err = handleParallelExcludeIncludeDB();
      }
      if (err.name === "JsonWebTokenError") err = handleJWTError();
      if (err.name === "TokenExpiredError") err = handleJWTExpiration();
      if (err instanceof multer.MulterError) err = handleMulterError(err);
      sendErrorProd(err, req, res);
    };
    module2.exports = globalErrorHandler;
  }
});

// models/userModel.js
var require_userModel = __commonJS({
  "models/userModel.js"(exports2, module2) {
    var crypto = require("crypto");
    var validator = require("validator");
    var bcrypt = require("bcrypt");
    var mongoose2 = require("mongoose");
    var { Schema, model } = mongoose2;
    var userSchema = new Schema(
      {
        name: {
          type: String,
          required: [true, "Please tell us your name"],
          trim: true
        },
        email: {
          type: String,
          required: [true, "Please prodive your email address"],
          validate: [validator.isEmail, "Please provide a valid email address"],
          lowercase: true,
          unique: true
        },
        photo: {
          type: String,
          trim: true
        },
        phone: {
          type: String,
          required: [true, "Phone number is required"],
          validate: {
            validator: function(v) {
              return validator.isMobilePhone(v);
            },
            message: (props) => `${props.value} is not a valid phone number!`
          }
        },
        role: {
          type: String,
          enum: {
            values: ["user", "aklogicAdmin"],
            message: "{VALUE} is not supported"
          },
          default: "user"
        },
        password: {
          type: String,
          required: [true, "Please provide a password"],
          validate: {
            validator: function(val) {
              return /^\S*$/.test(val);
            },
            message: "Space is not allowed in password"
          },
          minLength: [8, "Minimum password length is 8 character"],
          maxLength: [25, "Maximum password length is 25 character"],
          select: false
        },
        confirmPassword: {
          type: String,
          required: [true, "Confirm your password please"],
          validate: {
            // This only works on CREATE and SAVE!
            validator: function(val) {
              return val === this.password;
            },
            message: "Password does not matched"
          }
        },
        passwordChangedAt: Date,
        passwordResetToken: String,
        passwordResetExpires: Date,
        active: {
          type: Boolean,
          default: true,
          select: false
        },
        verified: {
          type: Boolean,
          default: false
        }
      },
      {
        timestamps: true
      }
    );
    userSchema.pre("save", async function(next) {
      if (!this.isModified("password")) return next();
      this.password = await bcrypt.hash(this.password, 10);
      this.confirmPassword = void 0;
      next();
    });
    userSchema.pre("save", function(next) {
      if (!this.isModified("password") || this.isNew) return next();
      this.passwordChangedAt = Date.now() - 1e3;
      next();
    });
    userSchema.pre(/^find/, function(next) {
      this.find({ active: { $ne: false } });
      next();
    });
    userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
      return await bcrypt.compare(candidatePassword, userPassword);
    };
    userSchema.methods.changedPasswordAfter = function(JWTIssuedTime) {
      if (this.passwordChangedAt) {
        const passwordChangeTime = parseInt(
          this.passwordChangedAt.getTime() / 1e3,
          10
        );
        return JWTIssuedTime < passwordChangeTime;
      }
      return false;
    };
    userSchema.methods.createPasswordResetToken = function() {
      const resetToken = crypto.randomBytes(32).toString("hex");
      this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
      this.passwordResetExpires = Date.now() + 10 * 60 * 1e3;
      return this.passwordResetToken;
    };
    var User2 = model("User", userSchema);
    module2.exports = User2;
  }
});

// utils/Email.js
var require_Email = __commonJS({
  "utils/Email.js"(exports2, module2) {
    var nodemailer = require("nodemailer");
    var { convert } = require("html-to-text");
    module2.exports = class Email {
      constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(" ")[0];
        this.url = url;
        this.from = `RPC World BD <${process.env.EMAIL_FROM}>`;
      }
      newTransport() {
        return nodemailer.createTransport({
          host: process.env.EMAIL_HOST,
          port: process.env.EMAIL_PORT,
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
          }
        });
      }
      async send(html, subject) {
        const mailOptions = {
          from: this.from,
          to: this.to,
          subject,
          html,
          text: convert(html)
        };
        await this.newTransport().sendMail(mailOptions);
      }
      async sendWelcome() {
        const html = `
      <h1>Welcome to the RPC World BD Family, ${this.firstName}!</h1>
      <p>We are excited to have you onboard.</p>
      <p>Click <a href="${this.url}">here</a> to get started.</p>
    `;
        await this.send(html, "Welcome to the RPC World BD Family!");
      }
      async sendPasswordReset() {
        const html = `
    <h1>Password Reset Request</h1>
    <p>Hi ${this.firstName},</p>
    <p>You requested a password reset. Click the link below to set a new password. This link is valid for only 10 minutes.</p>
    <p><a href="${this.url}">Reset your password</a></p>
    <p>If you did not request a password reset, please ignore this email.</p>
    <p>Thanks,</p>
    <p>RPC World BD Team</p>
  `;
        await this.send(
          html,
          "Your password reset token (valid only for 10 minutes)"
        );
      }
      async sendInvoice(order) {
        const html = `
      <h1>Your Order Invoice</h1>
      <p>Hi ${this.firstName},</p>
      <p>Thank you for your order. Here are the details:</p>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="border: 1px solid #ddd; padding: 8px;">Product</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Quantity</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Color</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Size</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Price</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Discount</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${order.products.map((product) => {
          const option = product.option;
          if (!option) {
            const productName2 = product.product && product.product.name || "Deleted Product Variant";
            return `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${productName2}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${product.quantity}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">N/A</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">N/A</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">N/A</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">N/A</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">N/A</td>
                </tr>
              `;
          }
          const originalPrice = option.price || 0;
          const discountPrice = option.salePrice || originalPrice;
          const discountAmount = originalPrice - discountPrice;
          const discountPercentage = originalPrice > 0 ? (discountAmount / originalPrice * 100).toFixed(2) : "0.00";
          const subtotal = discountPrice * product.quantity;
          const productName = option.product && option.product.name || product.product && product.product.name || "Unknown Product";
          const colorName = option.variant && option.variant.colorName || "N/A";
          const colorCode = option.variant && option.variant.colorCode || "";
          const size = option.size || "N/A";
          return `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${productName}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${product.quantity}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">
                  <div>
                    <div style="width: 42%; margin: 0 auto;">
                      <div style="float: left;">
                        ${colorName}
                      </div>
                      ${colorCode ? `
                      <div style="width: 12px; height: 12px; border-radius: 50%; margin-top: 4.5px; float: right; background-color: ${colorCode}">
                      </div>
                      ` : ""}
                    </div>
                  </div>
                </td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${size}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">\u09F3 ${originalPrice.toFixed(2)}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">\u09F3 ${discountAmount.toFixed(2)} (${discountPercentage}%)</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">\u09F3 ${subtotal.toFixed(2)}</td>
              </tr>
            `;
        }).join("")}
        </tbody>
      </table>
      <p>
        <strong>
          Shipping Cost: ${order.shippingCost > 0 ? ` \u09F3 ${order.shippingCost}` : "FREE"}
        </strong>
      </p>
      <p><strong>Sub-Total: \u09F3 ${order.totalCost}</strong></p>
      <p><strong>Order Status: ${order.orderStatus.toUpperCase()}</strong></p>
      <p>Thanks for shopping with us!</p>
      <p>Website Developed by <a href='https://www.okobiz.com'>okobiz</a></p>
    `;
        await this.send(html, "Your Order Invoice");
      }
      async sendInvoiceWithCoupon(order, discountPercent) {
        const html = `
      <h1>Your Order Invoice</h1>
      <p>Hi ${this.firstName},</p>
      <p>Thank you for your order. Here are the details:</p>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="border: 1px solid #ddd; padding: 8px;">Product</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Quantity</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Color</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Size</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Price</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Discount</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${order.products.map((product) => {
          const option = product.option;
          if (!option) {
            const productName2 = product.product && product.product.name || "Deleted Product Variant";
            return `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${productName2}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${product.quantity}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">N/A</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">N/A</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">N/A</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">N/A</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">N/A</td>
                </tr>
              `;
          }
          const originalPrice = option.price || 0;
          const subtotal = originalPrice * product.quantity;
          const productName = option.product && option.product.name || product.product && product.product.name || "Unknown Product";
          const colorName = option.variant && option.variant.colorName || "N/A";
          const colorCode = option.variant && option.variant.colorCode || "";
          const size = option.size || "N/A";
          return `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">
                  ${productName}
                </td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">
                  ${product.quantity}
                </td>
                <td style="border: 1px solid #ddd; padding: 8px;">
                  <div>
                    <div style="width: 42%; margin: 0 auto;">
                      <div style="float: left;">
                        ${colorName}
                      </div>
                      ${colorCode ? `
                      <div style="width: 12px; height: 12px; border-radius: 50%; margin-top: 4.5px; float: right; background-color: ${colorCode}">
                      </div>
                      ` : ""}
                    </div>
                  </div>
                </td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">
                  ${size}
                </td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">
                  \u09F3 ${originalPrice.toFixed(2)}
                </td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">
                  N/A
                </td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">
                  \u09F3 ${subtotal.toFixed(2)}
                </td>
              </tr>
            `;
        }).join("")}
        </tbody>
      </table>
      <p>
        <strong>
          Shipping Cost: ${order.shippingCost > 0 ? ` \u09F3 ${order.shippingCost}` : "FREE"}
        </strong>
      </p>
      <p>
        <strong>
          Product Total: \u09F3 ${order.products.reduce(
          (total, product) => {
            const price = product.option && product.option.price || 0;
            return total + price * product.quantity;
          },
          0
        ).toFixed(2)}
        </strong>
      </p>
      <p>
        <strong>
          Coupon Discount: (${discountPercent}%): \u09F3 ${order.couponDiscount.toFixed(
          2
        )}
        </strong>
      </p>
      <p>
        <strong>
          Sub-Total: \u09F3 ${order.totalCost.toFixed(2)}
        </strong>
      </p>
      <p>
        <strong>
          Order Status: ${order.orderStatus.toUpperCase()}
        </strong>
      </p>
      <p>Thanks for shopping with us!</p>
      <p>Website Developed by <a href='https://www.okobiz.com'>okobiz</a></p>
    `;
        await this.send(html, "Your Order Invoice");
      }
    };
  }
});

// utils/catchAsync.js
var require_catchAsync = __commonJS({
  "utils/catchAsync.js"(exports2, module2) {
    var catchAsync = (fn) => {
      return (req, res, next) => {
        fn(req, res, next).catch(next);
      };
    };
    module2.exports = catchAsync;
  }
});

// controllers/authController.js
var require_authController = __commonJS({
  "controllers/authController.js"(exports2) {
    var User2 = require_userModel();
    var AppError = require_AppError();
    var Email = require_Email();
    var catchAsync = require_catchAsync();
    exports2.signupController = catchAsync(async (req, res, next) => {
      const user = await User2.create(req.body);
      user.password = void 0;
      const url = `${req.protocol}://${req.get("host")}/profile`;
      await new Email(user, url).sendWelcome();
      res.status(201).json({
        status: "success",
        message: "Signup has been complited successfully",
        data: {
          user
        }
      });
    });
    exports2.loginController = catchAsync(async (req, res, next) => {
      const { email, password } = req.body;
      if (!email || !password) {
        return next(new AppError("Please provide email and password!", 400));
      }
      const user = await User2.findOne({ email }).select("+password");
      if (!user || !await user.correctPassword(password, user.password)) {
        return next(new AppError("Incorrect email or password", 401));
      }
      user.password = void 0;
      res.status(200).json({
        status: "success",
        message: "You are logged in successfully",
        data: {
          user
        }
      });
    });
    exports2.forgotPasswordController = catchAsync(async (req, res, next) => {
      const { email } = req.body;
      if (!email) return next(new AppError("Email is required!", 400));
      const user = await User2.findOne({ email });
      if (!user) {
        return next(new AppError("No user found with that email address!", 404));
      }
      const resetToken = user.createPasswordResetToken();
      await user.save({ validateBeforeSave: false });
      try {
        const resetURL = `http://localhost:5173/resetPassword/${resetToken}`;
        await new Email(user, resetURL).sendPasswordReset();
        res.status(200).json({
          status: "success",
          message: "Password reset email sent, Check your inbox please."
        });
      } catch (err) {
        user.passwordResetToken = void 0;
        user.passwordResetExpires = void 0;
        await user.save({ validateBeforeSave: false });
        return next(
          new AppError(
            "There was an error sending the email, Try again later!",
            500
          )
        );
      }
    });
    exports2.resetPasswordController = catchAsync(async (req, res, next) => {
      const { password, confirmPassword } = req.body;
      const { token } = req.params;
      const user = await User2.findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: Date.now() }
      });
      if (!user) return next(new AppError("Token is invalid or has expired!", 400));
      user.password = password;
      user.confirmPassword = confirmPassword;
      user.passwordResetToken = void 0;
      user.passwordResetExpires = void 0;
      await user.save();
      res.status(200).json({
        status: "success",
        message: "Password has been updated successfully"
      });
    });
  }
});

// routes/api/authRotue.js
var require_authRotue = __commonJS({
  "routes/api/authRotue.js"(exports2, module2) {
    var express = require("express");
    var {
      signupController,
      loginController,
      forgotPasswordController,
      resetPasswordController
    } = require_authController();
    var router = express.Router();
    router.post("/signup", signupController);
    router.post("/login", loginController);
    router.post("/forgotPassword", forgotPasswordController);
    router.patch("/resetPassword/:token", resetPasswordController);
    module2.exports = router;
  }
});

// utils/APIFeatures.js
var require_APIFeatures = __commonJS({
  "utils/APIFeatures.js"(exports2, module2) {
    var APIFeatures = class {
      constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
      }
      filter() {
        const queryObj = { ...this.queryString };
        const excludedFields = ["sort", "fields", "page", "limit"];
        excludedFields.forEach((item) => delete queryObj[item]);
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
        const parsedQuery = JSON.parse(queryStr);
        if (parsedQuery.title && typeof parsedQuery.title === "string") {
          parsedQuery.title = { $regex: `^${parsedQuery.title}$`, $options: "i" };
        }
        this.query = this.query.find(parsedQuery);
        return this;
      }
      sort() {
        if (this.queryString.sort) {
          const sortBy = this.queryString.sort.split(",").join(" ");
          this.query = this.query.sort(sortBy);
        } else {
          this.query = this.query.sort("-createdAt");
        }
        return this;
      }
      limitFields() {
        if (this.queryString.fields) {
          const fields = this.queryString.fields.split(",").join(" ");
          this.query = this.query.select(fields).select("-__v");
        } else {
          this.query = this.query.select("-__v");
        }
        return this;
      }
      paginate() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 1e4;
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);
        return this;
      }
    };
    module2.exports = APIFeatures;
  }
});

// models/categoryModel.js
var require_categoryModel = __commonJS({
  "models/categoryModel.js"(exports2, module2) {
    var slugify = require("slugify");
    var mongoose2 = require("mongoose");
    var { Schema, model } = mongoose2;
    var categorySchema = new Schema(
      {
        title: {
          type: String,
          required: [true, "Category title is required"],
          trim: true,
          unique: true
        },
        isActive: {
          type: Boolean,
          default: true
        },
        slug: {
          type: String
        },
        photos: [
          {
            type: String,
            required: [true, "Photo is required"],
            trim: true
          }
        ],
        subCategories: [
          {
            type: Schema.Types.ObjectId,
            ref: "SubCategory",
            require: [true, "Subcategory is required"]
          }
        ]
      },
      {
        timestamps: true
      }
    );
    categorySchema.pre("save", function(next) {
      this.slug = slugify(this.title, { lower: true });
      next();
    });
    var Category = model("Category", categorySchema);
    module2.exports = Category;
  }
});

// models/subCategoryModel.js
var require_subCategoryModel = __commonJS({
  "models/subCategoryModel.js"(exports2, module2) {
    var slugify = require("slugify");
    var mongoose2 = require("mongoose");
    var { Schema, model } = mongoose2;
    var subCategorySchema = new Schema(
      {
        title: {
          type: String,
          trim: true
        },
        isActive: {
          type: Boolean,
          default: true
        },
        slug: {
          type: String
        },
        category: {
          type: Schema.Types.ObjectId,
          ref: "Category"
        },
        childCategories: [
          {
            type: Schema.Types.ObjectId,
            ref: "ChildCategory"
          }
        ],
        brands: [
          {
            type: Schema.Types.ObjectId,
            ref: "Brand"
          }
        ]
      },
      {
        timestamps: true
      }
    );
    var SubCategory = model("SubCategory", subCategorySchema);
    module2.exports = SubCategory;
  }
});

// models/brandModel.js
var require_brandModel = __commonJS({
  "models/brandModel.js"(exports2, module2) {
    var slugify = require("slugify");
    var mongoose2 = require("mongoose");
    var { Schema, model } = mongoose2;
    var brandSchema = new Schema(
      {
        title: {
          type: String,
          required: [true, "Brand title is required"],
          trim: true,
          unique: true
        },
        photo: {
          type: String,
          required: [true, "Photo is required"],
          trim: true
        },
        isActive: {
          type: Boolean,
          default: true
        },
        slug: {
          type: String
        },
        // category: {
        //   type: Schema.Types.ObjectId,
        //   ref: "Category",
        //   required: [true, "Category is required"],
        // },
        // subCategory: {
        //   type: Schema.Types.ObjectId,
        //   ref: "SubCategory",
        //   required: [true, "Sub-Category is required"],
        // },
        products: [
          {
            type: Schema.Types.ObjectId,
            ref: "Product"
          }
        ]
      },
      {
        timestamps: true
      }
    );
    brandSchema.pre("save", function(next) {
      this.slug = slugify(this.title, { lower: true });
      next();
    });
    var Brand = model("Brand", brandSchema);
    module2.exports = Brand;
  }
});

// models/productModel.js
var require_productModel = __commonJS({
  "models/productModel.js"(exports2, module2) {
    var slugify = require("slugify");
    var mongoose2 = require("mongoose");
    var { Schema, model } = mongoose2;
    var productSchema = new Schema(
      {
        name: {
          type: String,
          required: [true, "Product name is required"],
          trim: true,
          unique: true
        },
        isBundle: {
          type: Boolean,
          default: false
        },
        price: {
          type: Number
        },
        totalPrice: {
          type: Number,
          default: 0
        },
        bundleProducts: {
          type: [Schema.Types.ObjectId],
          ref: "Product"
        },
        photos: [
          {
            type: String,
            required: [true, "Photo is required"],
            trim: true
          }
        ],
        description: {
          type: String,
          // required: [true, "Product description is required"],
          trim: true,
          required: false
        },
        slug: {
          type: String
        },
        category: {
          type: Schema.Types.ObjectId,
          ref: "Category",
          required: [true, "Category is required"]
        },
        subCategory: {
          type: Schema.Types.ObjectId,
          ref: "SubCategory",
          required: [true, "Sub-Category is required"]
        },
        childCategory: {
          type: Schema.Types.ObjectId,
          ref: "ChildCategory"
        },
        brand: {
          type: Schema.Types.ObjectId,
          ref: "Brand"
        },
        variants: [
          {
            type: Schema.Types.ObjectId,
            ref: "Variant"
          }
        ]
      },
      {
        timestamps: true
      }
    );
    productSchema.pre("validate", function(next) {
      if (this.isNew && (!this.photos || this.photos.length === 0)) {
        this.invalidate("photos", "At least one photo is required");
      }
      next();
    });
    productSchema.pre("save", function(next) {
      this.slug = slugify(this.name, { lower: true });
      next();
    });
    var Product = model("Product", productSchema);
    module2.exports = Product;
  }
});

// models/variantModel.js
var require_variantModel = __commonJS({
  "models/variantModel.js"(exports2, module2) {
    var mongoose2 = require("mongoose");
    var { Schema, model } = mongoose2;
    var variantSchema = new Schema({
      colorName: {
        type: String
        // required: [true, "Color name is required"],
      },
      colorCode: {
        type: String,
        validate: [
          {
            validator: function(value) {
              return !value || value.length >= 4 && value.length <= 7;
            },
            message: "Color code length must be between 4 and 7 characters if provided"
          },
          {
            validator: function(value) {
              return !value || /^#([0-9A-Fa-f]{3}){1,2}$/.test(value);
            },
            message: (props) => `${props.value} is not a valid hexadecimal color code!`
          }
        ]
      },
      details: {
        type: String
      },
      options: [
        {
          type: Schema.Types.ObjectId,
          ref: "Option"
        }
      ],
      category: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: [true, "Category is required"]
      },
      subCategory: {
        type: Schema.Types.ObjectId,
        ref: "SubCategory",
        required: [true, "Sub-Category is required"]
      },
      childCategory: {
        type: Schema.Types.ObjectId,
        ref: "ChildCategory"
      },
      brand: {
        type: Schema.Types.ObjectId,
        ref: "Brand"
        // required: [true, "Brand is required"],
      },
      product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: [true, "Product id is required"]
      }
    });
    variantSchema.index({ product: 1, colorName: 1 }, { unique: true });
    var Variant = model("Variant", variantSchema);
    module2.exports = Variant;
  }
});

// models/optionModel.js
var require_optionModel = __commonJS({
  "models/optionModel.js"(exports2, module2) {
    var mongoose2 = require("mongoose");
    var { Schema, model } = mongoose2;
    var optionSchema = new Schema({
      sku: {
        type: String,
        // required: [true, "SKU is required"],
        // unique: false,
        default: "none"
      },
      size: {
        type: String,
        // required: [true, "Size is required"],
        required: false
      },
      price: {
        type: Number,
        required: [true, "Price is required"]
      },
      salePrice: {
        type: Number,
        default: 0
      },
      stock: {
        type: Number,
        required: [true, "Stock number is required"]
      },
      discountType: {
        type: String,
        enum: {
          values: ["none", "percent", "amount"],
          message: "{VALUE} is not supported, Enter a valid discount type"
        },
        default: "none"
      },
      discountValue: {
        type: Number,
        default: 0
      },
      freeShipping: {
        type: Boolean,
        default: false
      },
      visitCount: {
        type: Number,
        default: 0
      },
      saleNumber: {
        type: Number,
        default: 0
      },
      category: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: [true, "Category is required"]
      },
      subCategory: {
        type: Schema.Types.ObjectId,
        ref: "SubCategory",
        required: [true, "Sub-Category is required"]
      },
      childCategory: {
        type: Schema.Types.ObjectId,
        ref: "ChildCategory"
      },
      brand: {
        type: Schema.Types.ObjectId,
        ref: "Brand",
        // required: [true, "Brand is required"],
        required: false
      },
      product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: [true, "Product id is required"]
      },
      variant: {
        type: Schema.Types.ObjectId,
        ref: "Variant",
        required: [true, "Variant is required"]
      }
    });
    optionSchema.index({ variant: 1, size: 1 }, { unique: true });
    optionSchema.pre("save", function(next) {
      this.size = this?.size?.toUpperCase();
      next();
    });
    var Option = model("Option", optionSchema);
    module2.exports = Option;
  }
});

// utils/deleteFile.js
var require_deleteFile = __commonJS({
  "utils/deleteFile.js"(exports2, module2) {
    var fs = require("fs");
    var deleteFile = (filePath) => {
      return new Promise((resolve, reject) => {
        fs.unlink(filePath, (err) => {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      });
    };
    module2.exports = deleteFile;
  }
});

// utils/handleFactory.js
var require_handleFactory = __commonJS({
  "utils/handleFactory.js"(exports2) {
    var AppError = require_AppError();
    var APIFeatures = require_APIFeatures();
    var catchAsync = require_catchAsync();
    exports2.deleteOne = (Model) => catchAsync(async (req, res, next) => {
      const doc = await Model.findByIdAndDelete(req.params.id);
      if (!doc) return next(new AppError("No document found with that ID!", 404));
      res.status(204).json({
        status: "success",
        data: null
      });
    });
    exports2.updateOne = (Model) => catchAsync(async (req, res, next) => {
      const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
      }).select("-__v");
      if (!doc) return next(new AppError("No document found with that ID!", 404));
      res.status(200).json({
        status: "success",
        message: "Document has been updated successfully",
        data: {
          doc
        }
      });
    });
    exports2.createOne = (Model) => catchAsync(async (req, res, next) => {
      const doc = await Model.create(req.body);
      res.status(201).json({
        status: "success",
        data: {
          doc
        }
      });
    });
    exports2.getOne = (Model, popOptions) => catchAsync(async (req, res, next) => {
      let query = Model.findById(req.params.id).select("-__v");
      if (popOptions) {
        if (Array.isArray(popOptions)) {
          popOptions.forEach((option) => {
            query = query.populate(option);
          });
        } else {
          query = query.populate(popOptions);
        }
      }
      const doc = await query;
      if (!doc) return next(new AppError("No document found with that ID!", 404));
      res.status(200).json({
        status: "success",
        data: {
          doc
        }
      });
    });
    exports2.getAll = (Model, popOptions) => catchAsync(async (req, res, next) => {
      let query = Model.find({});
      if (popOptions) {
        if (Array.isArray(popOptions)) {
          popOptions.forEach((option) => {
            query = query.populate(option);
          });
        } else {
          query = query.populate(popOptions);
        }
      }
      const features = new APIFeatures(query, req.query).filter().sort().limitFields().paginate();
      const doc = await features.query.select("-__v");
      res.status(200).json({
        status: "success",
        results: doc.length,
        data: {
          doc
        }
      });
    });
  }
});

// controllers/categoryController.js
var require_categoryController = __commonJS({
  "controllers/categoryController.js"(exports2) {
    var fs = require("fs").promises;
    var path = require("path");
    var APIFeatures = require_APIFeatures();
    var AppError = require_AppError();
    var Category = require_categoryModel();
    var SubCategory = require_subCategoryModel();
    var Brand = require_brandModel();
    var Product = require_productModel();
    var Variant = require_variantModel();
    var Option = require_optionModel();
    var catchAsync = require_catchAsync();
    var deleteFile = require_deleteFile();
    var { getAll, getOne } = require_handleFactory();
    exports2.createCategoryController = catchAsync(async (req, res, next) => {
      const body = { ...req.body };
      if (req.files && req.files.length > 0) {
        body.photos = req.files.map((file) => {
          return `${req.protocol}://${req.get("host")}/uploads/products/${file.filename}`;
        });
      } else {
        delete body.photos;
      }
      try {
        const product = await Category.create(body);
        res.status(201).json({
          status: "success",
          message: "Product has been created successfully",
          data: {
            product
          }
        });
      } catch (error) {
        if (error.errors) {
          const messages = Object?.values(error.errors).map((item) => item.properties.message).join(", ");
          return next(new AppError(`Validation failed, ${messages}.`, 400));
        } else if (error.code === 11e3) {
          const field = Object.keys(error.keyPattern).join(" ");
          const capitalizeField = field.charAt(0).toUpperCase() + field.slice(1).toLocaleLowerCase();
          const message = `${capitalizeField} already exist, Please use another ${field}.`;
          return next(new AppError(message, 409));
        }
        if (req.files && req.files.length > 0) {
          req.files.forEach((file) => {
            const filePath = `uploads/products/${file.fileName}`;
            fs.unlink(filePath, (err) => {
              if (err) {
                return next(new AppError(`Error removing file: ${filePath}`, 500));
              }
            });
          });
        }
        return next(
          new AppError(`Something went wrong while creating varient`, 400)
        );
      }
    });
    exports2.getAllCategoryController = getAll(Category, {
      path: "subCategories",
      select: "slug isActive"
    });
    exports2.getCategoryController = getOne(Category, {
      path: "subCategories",
      select: "title slug isActive"
    });
    exports2.updateCategoryController = catchAsync(async (req, res, next) => {
      const body = { ...req.body };
      const category = await Category.findById(req.params.id);
      if (!category) {
        return next(new AppError("No category was found with that ID!", 404));
      }
      Object.keys(req.body).forEach((key) => {
        category[key] = req.body[key];
      });
      if (req.files && req.files.length > 0) {
        body.photos = req.files.map((file) => {
          return `${req.protocol}://${req.get("host")}/uploads/products/${file.filename}`;
        });
      } else {
        delete body.photos;
      }
      try {
        await Category.findByIdAndUpdate(req.params.id, body);
      } catch {
        if (req.files && req.files.length > 0) {
          req.files.forEach((file) => {
            const filePath = `uploads/products/${file.fileName}`;
            fs.unlink(filePath, (err) => {
              if (err) {
                return next(new AppError(`Error removing file: ${filePath}`, 500));
              }
            });
          });
        }
        return next(
          new AppError(`Something went wrong while update Category`, 400)
        );
      }
      res.status(200).json({
        status: "success",
        message: "Category has been updated successfully",
        data: {
          category
        }
      });
    });
    exports2.deleteCategoryController = catchAsync(async (req, res, next) => {
      const category = await Category.findById(req.params.id);
      if (!category) {
        return next(new AppError("No category was found with that ID!", 404));
      }
      const subCategories = await SubCategory.find({ category: category._id });
      for (const subCategory of subCategories) {
        const brands = await Brand.find({ subCategory: subCategory._id });
        for (const brand of brands) {
          if (brand.photo) {
            const photoName = brand.photo.split("/").pop();
            const photoPath = path.join(
              __dirname,
              "..",
              "uploads",
              "brand",
              photoName
            );
            try {
              await fs.access(photoPath);
              await deleteFile(photoPath);
            } catch {
            }
          }
          const products = await Product.find({ brand: brand._id });
          for (const product of products) {
            if (product.photos && product.photos.length > 0) {
              for (const photoPath of product.photos) {
                const photoName = photoPath.split("/").pop();
                const fullPath = path.join(
                  __dirname,
                  "..",
                  "uploads",
                  "products",
                  photoName
                );
                try {
                  await fs.access(fullPath);
                  await deleteFile(fullPath);
                } catch {
                }
              }
            }
            const variants = await Variant.find({ product: product._id });
            for (const variant of variants) {
              await Option.deleteMany({ variant: variant._id });
              await Variant.findByIdAndDelete(variant._id);
            }
            await Product.findByIdAndDelete(product._id);
          }
          await Brand.findByIdAndDelete(brand._id);
        }
        await SubCategory.findByIdAndDelete(subCategory._id);
      }
      await Category.findByIdAndDelete(category._id);
      res.status(204).json({
        status: "success",
        message: "Category has been deleted successfully along with all associated sub-categories, brands, products, variants, and options.",
        data: null
      });
    });
    exports2.getProductsByCategory = catchAsync(async (req, res, next) => {
      const { categoryId } = req.params;
      const category = await Category.findById(categoryId);
      if (!category) {
        return next(new AppError("No category found with that ID!", 404));
      }
      const products = await Product.find({ category: categoryId }).populate([
        {
          path: "category subCategory brand",
          select: "title"
        },
        {
          path: "variants",
          select: "colorname colorCode details"
        }
      ]).select("-__v");
      res.status(200).json({
        status: "success",
        results: products.length,
        data: {
          products
        }
      });
    });
    exports2.getVariantsByCategory = catchAsync(async (req, res, next) => {
      const { categoryId } = req.params;
      const category = await Category.findById(categoryId);
      if (!category) {
        return next(new AppError("No category found with that ID!", 404));
      }
      const variants = await Variant.find({ category: categoryId }).populate([
        {
          path: "category subCategory brand",
          select: "title"
        },
        {
          path: "product",
          select: "-category -subCategory -brand -variants -__v"
        },
        {
          path: "options",
          select: "-category -subCategory -brand -product -variant -__v"
        }
      ]).select("-__v");
      res.status(200).json({
        status: "success",
        results: variants.length,
        data: {
          variants
        }
      });
    });
    exports2.getOptionsByCategory = catchAsync(async (req, res, next) => {
      const { categoryId } = req.params;
      const category = await Category.findById(categoryId);
      if (!category) {
        return next(new AppError("No category found with that ID!", 404));
      }
      const query = Option.find({ category: categoryId }).populate([
        {
          path: "category subCategory brand",
          select: "title"
        },
        {
          path: "product",
          select: "-category -subCategory -brand -variants -__v"
        },
        {
          path: "variant",
          select: "colorName colorCode details"
        }
      ]).select("-__v");
      const features = new APIFeatures(query, req.query).filter().sort().limitFields().paginate();
      const options = await features.query;
      res.status(200).json({
        status: "success",
        results: options.length,
        data: {
          options
        }
      });
    });
  }
});

// middlewares/uploadPhotoMiddleware.js
var require_uploadPhotoMiddleware = __commonJS({
  "middlewares/uploadPhotoMiddleware.js"(exports2, module2) {
    var path = require("path");
    var multer = require("multer");
    var sharp = require("sharp");
    var AppError = require_AppError();
    var catchAsync = require_catchAsync();
    var multerStorage = multer.memoryStorage();
    var multerFilter = (req, file, cb) => {
      if (file.mimetype.startsWith("image")) {
        cb(null, true);
      } else {
        cb(new AppError("Not an image, Please upload images only", 400), false);
      }
    };
    var upload = multer({ storage: multerStorage, fileFilter: multerFilter });
    var uploadPhotoMiddleware = (multiple = false, maxFiles = 7) => {
      return multiple ? upload.array("photos", maxFiles) : upload.single("photo");
    };
    var resizePhotoMiddleware = (directory) => {
      return catchAsync(async (req, res, next) => {
        const files = req.file ? [req.file] : req.files || [];
        if (files.length === 0) return next();
        const uniqueSuffix = () => Date.now() + "-" + Math.round(Math.random() * 1e9);
        const processImage = async (file) => {
          const originalExtension = path.extname(file.originalname);
          file.filename = `${directory}-${uniqueSuffix()}${originalExtension}`;
          const dimensions = {}[directory] || {};
          try {
            const transformer = sharp(file.buffer);
            if (directory !== "banner") {
              transformer.resize(dimensions.width, dimensions.height);
            }
            transformer.toFormat(originalExtension.slice(1)).toFile(`uploads/${directory}/${file.filename}`, {
              quality: dimensions.quality
            });
            file.fileName = file.filename;
          } catch (err) {
            return next(new AppError("Failed while processing the image", 500));
          }
        };
        await Promise.all(files.map(processImage));
        next();
      });
    };
    module2.exports = { uploadPhotoMiddleware, resizePhotoMiddleware };
  }
});

// routes/api/categoryRoute.js
var require_categoryRoute = __commonJS({
  "routes/api/categoryRoute.js"(exports2, module2) {
    var express = require("express");
    var {
      createCategoryController,
      getAllCategoryController,
      getCategoryController,
      updateCategoryController,
      deleteCategoryController,
      getProductsByCategory,
      getVariantsByCategory,
      getOptionsByCategory
    } = require_categoryController();
    var { uploadPhotoMiddleware, resizePhotoMiddleware } = require_uploadPhotoMiddleware();
    var router = express.Router();
    router.route("/").post(
      uploadPhotoMiddleware(true, 4),
      resizePhotoMiddleware("products"),
      createCategoryController
    ).get(getAllCategoryController);
    router.route("/:id").get(getCategoryController).patch(
      uploadPhotoMiddleware(true, 4),
      resizePhotoMiddleware("products"),
      updateCategoryController
    ).delete(deleteCategoryController);
    router.get("/:categoryId/products", getProductsByCategory);
    router.get("/:categoryId/variants", getVariantsByCategory);
    router.get("/:categoryId/options", getOptionsByCategory);
    module2.exports = router;
  }
});

// controllers/subCategoryController.js
var require_subCategoryController = __commonJS({
  "controllers/subCategoryController.js"(exports2) {
    var path = require("path");
    var Category = require_categoryModel();
    var SubCategory = require_subCategoryModel();
    var Brand = require_brandModel();
    var Product = require_productModel();
    var Option = require_optionModel();
    var Variant = require_variantModel();
    var APIFeatures = require_APIFeatures();
    var AppError = require_AppError();
    var catchAsync = require_catchAsync();
    var deleteFile = require_deleteFile();
    var { getAll, getOne, updateOne } = require_handleFactory();
    exports2.createSubCategoryController = catchAsync(async (req, res, next) => {
      const { title, category } = req.body;
      if (!title) return next(new AppError("SubCategory title is required!", 400));
      if (!category) return next(new AppError("SubCategory category is required!", 400));
      let subCategory;
      try {
        subCategory = await SubCategory.create({ title, category });
      } catch (error) {
        return next(error);
      }
      const categoryDoc = await Category.findOneAndUpdate(
        { _id: subCategory.category },
        { $push: { subCategories: subCategory._id } },
        { new: true }
      );
      if (!categoryDoc) {
        return next(new AppError("No category found with that ID!", 404));
      }
      res.status(201).json({
        status: "success",
        data: {
          subCategory
        }
      });
    });
    exports2.getAllSubCategoryController = getAll(SubCategory, {
      path: "brands",
      select: "photo slug isActive"
    });
    exports2.getSubCategoryController = getOne(SubCategory, [
      {
        path: "category",
        select: "slug"
      },
      {
        path: "brands",
        select: "photo slug isActive"
      }
    ]);
    exports2.updateSubCategoryController = updateOne(SubCategory);
    exports2.deleteSubCategoryController = catchAsync(async (req, res, next) => {
      const subCategory = await SubCategory.findById(req.params.id);
      if (!subCategory) {
        return next(new AppError("No Sub-Category was found with that ID!", 404));
      }
      const brands = await Brand.find({ subCategory: subCategory._id });
      for (const brand of brands) {
        if (brand.photo) {
          const photoName = brand.photo.split("/").pop();
          const photoPath = path.join(
            __dirname,
            "..",
            "uploads",
            "brand",
            photoName
          );
          try {
            await deleteFile(photoPath);
          } catch (e) {
          }
        }
        const products = await Product.find({ brand: brand._id });
        for (const product of products) {
          if (product.photos && product.photos.length > 0) {
            for (const photoPath of product.photos) {
              const photoName = photoPath.split("/").pop();
              const productPhotoPath = path.join(
                __dirname,
                "..",
                "uploads",
                "products",
                photoName
              );
              try {
                await deleteFile(productPhotoPath);
              } catch (e) {
              }
            }
          }
          const variants = await Variant.find({ product: product._id });
          for (const variant of variants) {
            await Option.deleteMany({ variant: variant._id });
            await Variant.findByIdAndDelete(variant._id);
          }
          await Product.findByIdAndDelete(product._id);
        }
        await Brand.findByIdAndDelete(brand._id);
      }
      await Category.updateMany(
        { subCategories: subCategory._id },
        { $pull: { subCategories: subCategory._id } }
      );
      await SubCategory.findByIdAndDelete(subCategory._id);
      res.status(204).json({
        status: "success",
        message: "Sub-Category has been deleted successfully along with all associated brands, products, variants, and options",
        data: null
      });
    });
    exports2.getProductsBySubCategory = catchAsync(async (req, res, next) => {
      const { subCategoryId } = req.params;
      const subCategory = await SubCategory.findById(subCategoryId);
      if (!subCategory) {
        return next(new AppError("No sub-category found with that ID!", 404));
      }
      const products = await Product.find({ subCategory: subCategoryId }).select(
        "-__v"
      );
      res.status(200).json({
        status: "success",
        results: products.length,
        data: {
          products
        }
      });
    });
    exports2.getVariantsBySubCategory = catchAsync(async (req, res, next) => {
      const { subCategoryId } = req.params;
      const subCategory = await SubCategory.findById(subCategoryId);
      if (!subCategory) {
        return next(new AppError("No sub-category found with that ID!", 404));
      }
      const variants = await Variant.find({ subCategory: subCategoryId }).select(
        "-__v"
      );
      res.status(200).json({
        status: "success",
        results: variants.length,
        data: {
          variants
        }
      });
    });
    exports2.getOptionsBySubCategory = catchAsync(async (req, res, next) => {
      const { subCategoryId } = req.params;
      const subCategory = await SubCategory.findById(subCategoryId);
      if (!subCategory) {
        return next(new AppError("No sub-category found with that ID!", 404));
      }
      const query = Option.find({ subCategory: subCategoryId }).populate([
        {
          path: "category subCategory brand",
          select: "title"
        },
        {
          path: "product",
          select: "-category -subCategory -brand -variants -__v"
        },
        {
          path: "variant",
          select: "colorName colorCode details"
        }
      ]).select("-__v");
      const features = new APIFeatures(query, req.query).filter().sort().limitFields().paginate();
      const options = await features.query;
      res.status(200).json({
        status: "success",
        results: options.length,
        data: {
          options
        }
      });
    });
  }
});

// routes/api/subCategoryRoute.js
var require_subCategoryRoute = __commonJS({
  "routes/api/subCategoryRoute.js"(exports2, module2) {
    var express = require("express");
    var {
      createSubCategoryController,
      getAllSubCategoryController,
      getSubCategoryController,
      updateSubCategoryController,
      deleteSubCategoryController,
      getProductsBySubCategory,
      getVariantsBySubCategory,
      getOptionsBySubCategory
    } = require_subCategoryController();
    var router = express.Router();
    router.route("/").post(createSubCategoryController).get(getAllSubCategoryController);
    router.route("/:id").get(getSubCategoryController).patch(updateSubCategoryController).delete(deleteSubCategoryController);
    router.get("/:subCategoryId/products", getProductsBySubCategory);
    router.get("/:subCategoryId/variants", getVariantsBySubCategory);
    router.get("/:subCategoryId/options", getOptionsBySubCategory);
    module2.exports = router;
  }
});

// controllers/brandController.js
var require_brandController = __commonJS({
  "controllers/brandController.js"(exports2) {
    var fs = require("fs").promises;
    var path = require("path");
    var Brand = require_brandModel();
    var Product = require_productModel();
    var Variant = require_variantModel();
    var Option = require_optionModel();
    var APIFeatures = require_APIFeatures();
    var AppError = require_AppError();
    var catchAsync = require_catchAsync();
    var deleteFile = require_deleteFile();
    var { getOne, getAll } = require_handleFactory();
    exports2.createBrandController = catchAsync(async (req, res, next) => {
      const body = req.body;
      if (req.file) {
        body.photo = `${req.protocol}://${req.get("host")}/uploads/brand/${req.file.filename}`;
      } else {
        delete body.photo;
      }
      try {
        const brand = await Brand.create(body);
        res.status(201).json({
          status: "success",
          message: "Brand has been created successfully",
          data: {
            brand
          }
        });
      } catch (error) {
        if (req.file) {
          const filePath = path.join(__dirname, "..", "uploads", "brand", req.file.filename);
          fs.unlink(filePath).catch((err) => {
            console.error("Failed to delete file during brand creation failure:", err);
          });
        }
        if (error.errors) {
          const messages = Object.values(error.errors).map((item) => item.properties.message).join(", ");
          return next(new AppError(`Validation failed, ${messages}.`, 400));
        } else if (error.code === 11e3) {
          const field = Object.keys(error.keyPattern).join(" ");
          const capitalizeField = field.charAt(0).toUpperCase() + field.slice(1).toLocaleLowerCase();
          const message = `${capitalizeField} already exists, Please use another ${field}.`;
          return next(new AppError(message, 409));
        }
        return next(
          new AppError("Something went unexpected while creating the brand", 400)
        );
      }
    });
    exports2.updateBrandController = catchAsync(async (req, res, next) => {
      const brand = await Brand.findById(req.params.id);
      if (!brand) {
        return next(new AppError("No brand was found with that ID!", 404));
      }
      const body = req.body;
      let oldPhotoLink = null;
      if (brand.photo) {
        const photoName = brand.photo.split("/");
        oldPhotoLink = path.join(__dirname, "..", "uploads", "brand", photoName[photoName.length - 1]);
      }
      if (req.file) {
        body.photo = `${req.protocol}://${req.get("host")}/uploads/brand/${req.file.filename}`;
      } else {
        delete body.photo;
      }
      Object.keys(body).forEach((key) => {
        brand[key] = body[key];
      });
      await brand.save();
      if (req.file && oldPhotoLink) {
        fs.unlink(oldPhotoLink).catch((err) => {
          console.error("Failed to delete old photo:", err);
        });
      }
      res.status(200).json({
        status: "success",
        message: "Brand has been updated successfully",
        data: {
          brand
        }
      });
    });
    exports2.getBrandController = getOne(Brand);
    exports2.getAllBrandsController = getAll(Brand);
    exports2.deleteBrandController = catchAsync(async (req, res, next) => {
      const brand = await Brand.findById(req.params.id);
      if (!brand) {
        return next(new AppError("No brand was found with that ID!", 404));
      }
      if (brand.photo) {
        const photoName = brand.photo.split("/").pop();
        const photoPath = path.join(__dirname, "..", "uploads", "brand", photoName);
        try {
          await fs.access(photoPath);
          await deleteFile(photoPath);
        } catch (err) {
          console.error(`Failed to delete file: ${err.message}`);
        }
      }
      const products = await Product.find({ brand: brand._id });
      for (const product of products) {
        if (product.photos && product.photos.length > 0) {
          for (const photoPath of product.photos) {
            const photoName = photoPath.split("/").pop();
            const productPhotoPath = path.join(
              __dirname,
              "..",
              "uploads",
              "products",
              photoName
            );
            try {
              await fs.access(productPhotoPath);
              await deleteFile(productPhotoPath);
            } catch (err) {
              console.error(`Failed to delete file: ${err.message}`);
            }
          }
        }
        const variants = await Variant.find({ product: product._id });
        for (const variant of variants) {
          await Option.deleteMany({ variant: variant._id });
          await Variant.findByIdAndDelete(variant._id);
        }
        await Product.findByIdAndDelete(product._id);
      }
      await Brand.findByIdAndDelete(brand._id);
      res.status(204).json({
        status: "success",
        message: "Brand has been deleted successfully with all associated products, variants, and options.",
        data: null
      });
    });
    exports2.getProductsByBrand = catchAsync(async (req, res, next) => {
      const { brandId } = req.params;
      const brand = await Brand.findById(brandId);
      if (!brand) {
        return next(new AppError("No brand found with that ID!", 404));
      }
      const products = await Product.find({ brand: brandId }).select("-__v");
      res.status(200).json({
        status: "success",
        results: products.length,
        data: {
          products
        }
      });
    });
    exports2.getVariantsByBrand = catchAsync(async (req, res, next) => {
      const { brandId } = req.params;
      const brand = await Brand.findById(brandId);
      if (!brand) {
        return next(new AppError("No brand found with that ID!", 404));
      }
      const variants = await Variant.find({ brand: brandId }).select("-__v");
      res.status(200).json({
        status: "success",
        results: variants.length,
        data: {
          variants
        }
      });
    });
    exports2.getOptionsByBrand = catchAsync(async (req, res, next) => {
      const { brandId } = req.params;
      const brand = await Brand.findById(brandId);
      if (!brand) {
        return next(new AppError("No brand found with that ID!", 404));
      }
      const query = Option.find({ brand: brandId }).populate([
        // {
        //   path: "category subCategory brand",
        //   select: "title",
        // },
        {
          path: "brand",
          select: "title"
        },
        // {
        //   path: "product",
        //   select: "-category -subCategory -brand -variants -__v",
        // },
        {
          path: "product",
          select: "-brand -variants -__v"
        },
        {
          path: "variant",
          select: "colorName colorCode details"
        }
      ]).select("-__v");
      const features = new APIFeatures(query, req.query).filter().sort().limitFields().paginate();
      const options = await features.query;
      res.status(200).json({
        status: "success",
        results: options.length,
        data: {
          options
        }
      });
    });
  }
});

// routes/api/brandRoute.js
var require_brandRoute = __commonJS({
  "routes/api/brandRoute.js"(exports2, module2) {
    var express = require("express");
    var {
      uploadPhotoMiddleware,
      resizePhotoMiddleware
    } = require_uploadPhotoMiddleware();
    var {
      createBrandController,
      getAllBrandsController,
      getBrandController,
      updateBrandController,
      deleteBrandController,
      getProductsByBrand,
      getVariantsByBrand,
      getOptionsByBrand
    } = require_brandController();
    var router = express.Router();
    router.route("/").post(
      uploadPhotoMiddleware(),
      resizePhotoMiddleware("brand"),
      createBrandController
    ).get(getAllBrandsController);
    router.route("/:id").get(getBrandController).patch(
      uploadPhotoMiddleware(),
      resizePhotoMiddleware("brand"),
      updateBrandController
    ).delete(deleteBrandController);
    router.get("/:brandId/products", getProductsByBrand);
    router.get("/:brandId/variants", getVariantsByBrand);
    router.get("/:brandId/options", getOptionsByBrand);
    module2.exports = router;
  }
});

// controllers/productController.js
var require_productController = __commonJS({
  "controllers/productController.js"(exports2) {
    var fs = require("fs");
    var Brand = require_brandModel();
    var Product = require_productModel();
    var Variant = require_variantModel();
    var Option = require_optionModel();
    var APIFeatures = require_APIFeatures();
    var AppError = require_AppError();
    var catchAsync = require_catchAsync();
    var deleteFile = require_deleteFile();
    var { getAll, getOne } = require_handleFactory();
    exports2.createProductController = catchAsync(async (req, res, next) => {
      const body = req.body;
      const isLocalhost = req.get("host").includes("localhost");
      const protocol = isLocalhost ? "http" : "https";
      if (req.files && req.files.length > 0) {
        body.photos = req.files.map((file) => {
          const url = `${protocol}://${req.get("host")}/uploads/products/${file.filename}`;
          return url;
        });
      } else {
        delete body.photos;
      }
      if (body.videoUrl && body.videoUrl) {
        body.photos = body.photos || [];
        body.photos.push(body.videoUrl);
      }
      if (body.videoUrl) {
        return next(
          new AppError("Invalid link, Please provide a valid YouTube URL", 400)
        );
      }
      try {
        if (body?.brand == "undefined") {
          delete body.brand;
        }
        const product = await Product.create(body);
        const brand = await Brand.findOneAndUpdate(
          { _id: product?.brand },
          {
            $push: { products: product._id }
          },
          { new: true }
        );
        res.status(201).json({
          status: "success",
          message: "Product has been created successfully",
          data: {
            product
          }
        });
      } catch (error) {
        if (error.errors) {
          const messages = Object.values(error.errors).map((item) => item.properties.message).join(", ");
          return next(new AppError(`Validation failed, ${messages}.`, 400));
        } else if (error.code === 11e3) {
          const field = Object.keys(error.keyPattern).join(" ");
          const capitalizeField = field.charAt(0).toUpperCase() + field.slice(1).toLocaleLowerCase();
          const message = `${capitalizeField} already exist, Please use another ${field}.`;
          return next(new AppError(message, 409));
        }
        if (req.files && req.files.length > 0) {
          req.files.forEach((file) => {
            const filePath = `uploads/products/${file.fileName}`;
            fs.unlink(filePath, (err) => {
              if (err) {
                return next(new AppError(`Error removing file: ${filePath}`, 500));
              }
            });
          });
        }
        return next(
          new AppError(`Something went wrong while creating varient`, 400)
        );
      }
    });
    exports2.createProductBundleController = catchAsync(async (req, res, next) => {
      const body = req.body;
      const isLocalhost = req.get("host").includes("localhost");
      const protocol = isLocalhost ? "http" : "https";
      if (req.files && req.files.length > 0) {
        body.photos = req.files.map((file) => {
          const url = `${protocol}://${req.get("host")}/uploads/products/${file.filename}`;
          return url;
        });
      } else {
        delete body.photos;
      }
      if (body.videoUrl && body.videoUrl) {
        body.photos = body.photos || [];
        body.photos.push(body.videoUrl);
      }
      if (body.videoUrl) {
        return next(
          new AppError("Invalid link, Please provide a valid YouTube URL", 400)
        );
      }
      try {
        if (body?.brand == "undefined") {
          delete body.brand;
        }
        const product = await Product.create(body);
        const brand = await Brand.findOneAndUpdate(
          { _id: product?.brand },
          {
            $push: { products: product._id }
          },
          { new: true }
        );
        res.status(201).json({
          status: "success",
          message: "Product has been created successfully",
          data: {
            product
          }
        });
      } catch (error) {
        if (error.errors) {
          const messages = Object.values(error.errors).map((item) => item.properties.message).join(", ");
          return next(new AppError(`Validation failed, ${messages}.`, 400));
        } else if (error.code === 11e3) {
          const field = Object.keys(error.keyPattern).join(" ");
          const capitalizeField = field.charAt(0).toUpperCase() + field.slice(1).toLocaleLowerCase();
          const message = `${capitalizeField} already exist, Please use another ${field}.`;
          return next(new AppError(message, 409));
        }
        if (req.files && req.files.length > 0) {
          req.files.forEach((file) => {
            const filePath = `uploads/products/${file.fileName}`;
            fs.unlink(filePath, (err) => {
              if (err) {
                return next(new AppError(`Error removing file: ${filePath}`, 500));
              }
            });
          });
        }
        return next(
          new AppError(`Something went wrong while creating varient`, 400)
        );
      }
    });
    exports2.getAllProductsController = catchAsync(async (req, res, next) => {
      const allProduct = await Product.find().populate([
        {
          path: "category subCategory childCategory brand",
          select: "title"
        },
        {
          path: "bundleProducts",
          select: "name photos"
        },
        {
          path: "variants",
          select: "-category -subCategory -brand -product -__v",
          populate: {
            path: "options",
            select: "size price stock"
          }
        }
        // {
        //   path: "variants.options",
        //   // select: "category -subCategory -brand -product -__v",
        // },
      ]);
      res.status(200).json({
        status: "success",
        message: "Product has been updated successfully",
        data: {
          allProduct
        }
      });
    });
    exports2.getAllBundleController = catchAsync(async (req, res, next) => {
      const allProduct = await Product.find().populate([
        {
          path: "category subCategory childCategory brand",
          select: "title"
        },
        {
          path: "bundleProducts",
          select: "name"
        },
        {
          path: "variants",
          select: "-category -subCategory -brand -product -__v",
          populate: {
            path: "options",
            select: "size price stock"
          }
        }
        // {
        //   path: "variants.options",
        //   // select: "category -subCategory -brand -product -__v",
        // },
      ]);
      res.status(200).json({
        status: "success",
        message: "Product has been updated successfully",
        data: {
          allProduct
        }
      });
    });
    exports2.getProductController = getOne(Product, [
      {
        path: "category subCategory childCategory brand",
        select: "title"
      },
      {
        path: "bundleProducts",
        select: "name photos"
      },
      {
        path: "variants",
        select: "-category -subCategory -brand -product -__v",
        populate: {
          path: "options",
          select: "-category -subCategory -brand -product -variant -__v"
        }
      }
    ]);
    exports2.getProductBundleController = getOne(Product, [
      {
        path: "category subCategory childCategory brand",
        select: "title"
      },
      {
        path: "variants",
        select: "-category -subCategory -brand -product -__v",
        populate: {
          path: "options",
          select: "-category -subCategory -brand -product -variant -__v"
        }
      }
    ]);
    exports2.updateProductController = catchAsync(async (req, res, next) => {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return next(new AppError("No product was found with that ID!", 404));
      }
      const body = req.body;
      if (req.files && req.files.length > 0) {
        if (product.photos && product.photos.length > 0) {
          for (const photoPath of product.photos) {
            const photoName = photoPath.split("/").pop();
            const path = `uploads/products/${photoName}`;
            try {
              await deleteFile(path);
            } catch (err) {
              console.error(`Failed to delete file: ${err.message}`);
            }
          }
        }
        body.photos = req.files.map(
          (file) => `${req.protocol}://${req.get("host")}/uploads/products/${file.filename}`
        );
      }
      const isValidYouTubeUrl = (url) => {
        const regex = /^https:\/\/www\.youtube\.com\/embed\/[a-zA-Z0-9_-]{11}\?si=[a-zA-Z0-9_-]+$/;
        return regex.test(url);
      };
      if (body.videoUrl) {
        if (!isValidYouTubeUrl(body.videoUrl)) {
          return next(
            new AppError("Invalid link, Please provide a valid YouTube URL", 400)
          );
        }
        if (!product.photos.includes(body.videoUrl)) {
          if (body.photos) {
            body.photos.push(body.videoUrl);
          } else {
            product.photos = product.photos || [];
            product.photos.push(body.videoUrl);
          }
        }
      }
      Object.keys(body).forEach((key) => {
        product[key] = body[key];
      });
      await product.save();
      res.status(200).json({
        status: "success",
        message: "Product has been updated successfully",
        data: {
          product
        }
      });
    });
    exports2.updateProductController = catchAsync(async (req, res, next) => {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return next(new AppError("No product was found with that ID!", 404));
      }
      const body = req.body;
      if (req.files && req.files.length > 0) {
        if (product.photos && product.photos.length > 0) {
          for (const photoPath of product.photos) {
            const photoName = photoPath.split("/").pop();
            const path = `uploads/products/${photoName}`;
            try {
              await deleteFile(path);
            } catch (err) {
              console.error(`Failed to delete file: ${err.message}`);
            }
          }
        }
        body.photos = req.files.map(
          (file) => `${req.protocol}://${req.get("host")}/uploads/products/${file.filename}`
        );
      }
      const isValidYouTubeUrl = (url) => {
        const regex = /^https:\/\/www\.youtube\.com\/embed\/[a-zA-Z0-9_-]{11}\?si=[a-zA-Z0-9_-]+$/;
        return regex.test(url);
      };
      if (body.videoUrl) {
        if (!isValidYouTubeUrl(body.videoUrl)) {
          return next(
            new AppError("Invalid link, Please provide a valid YouTube URL", 400)
          );
        }
        if (!product.photos.includes(body.videoUrl)) {
          if (body.photos) {
            body.photos.push(body.videoUrl);
          } else {
            product.photos = product.photos || [];
            product.photos.push(body.videoUrl);
          }
        }
      }
      Object.keys(body).forEach((key) => {
        product[key] = body[key];
      });
      await product.save();
      res.status(200).json({
        status: "success",
        message: "Product has been updated successfully",
        data: {
          product
        }
      });
    });
    exports2.updateProductBundleController = catchAsync(async (req, res, next) => {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return next(new AppError("No product was found with that ID!", 404));
      }
      const body = req.body;
      if (req.files && req.files.length > 0) {
        if (product.photos && product.photos.length > 0) {
          for (const photoPath of product.photos) {
            const photoName = photoPath.split("/").pop();
            const path = `uploads/products/${photoName}`;
            try {
              await deleteFile(path);
            } catch (err) {
              console.error(`Failed to delete file: ${err.message}`);
            }
          }
        }
        body.photos = req.files.map(
          (file) => `${req.protocol}://${req.get("host")}/uploads/products/${file.filename}`
        );
      }
      const isValidYouTubeUrl = (url) => {
        const regex = /^https:\/\/www\.youtube\.com\/embed\/[a-zA-Z0-9_-]{11}\?si=[a-zA-Z0-9_-]+$/;
        return regex.test(url);
      };
      if (body.videoUrl) {
        if (!isValidYouTubeUrl(body.videoUrl)) {
          return next(
            new AppError("Invalid link, Please provide a valid YouTube URL", 400)
          );
        }
        if (!product.photos.includes(body.videoUrl)) {
          if (body.photos) {
            body.photos.push(body.videoUrl);
          } else {
            product.photos = product.photos || [];
            product.photos.push(body.videoUrl);
          }
        }
      }
      Object.keys(body).forEach((key) => {
        product[key] = body[key];
      });
      await product.save();
      res.status(200).json({
        status: "success",
        message: "Product has been updated successfully",
        data: {
          product
        }
      });
    });
    exports2.deleteProductController = catchAsync(async (req, res, next) => {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return next(new AppError("No product was found with that ID!", 404));
      }
      if (product.photos && product.photos.length > 0) {
        for (const photoPath of product.photos) {
          const photoName = photoPath.split("/").pop();
          const path = `uploads/products/${photoName}`;
          try {
            await deleteFile(path);
          } catch (err) {
            console.error(`Failed to delete file: ${err.message}`);
          }
        }
      }
      const variants = await Variant.find({ product: product._id });
      for (const variant of variants) {
        await Option.deleteMany({ variant: variant._id });
        await Variant.findByIdAndDelete(variant._id);
      }
      await Brand.findOneAndUpdate(
        { _id: product.brand },
        { $pull: { products: product._id } },
        { new: true }
      );
      await Product.findByIdAndDelete(product._id);
      res.status(204).json({
        status: "success",
        message: "Product and associated variants & options have been deleted successfully",
        data: null
      });
    });
    exports2.deleteProductBundleController = catchAsync(async (req, res, next) => {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return next(new AppError("No product was found with that ID!", 404));
      }
      if (product.photos && product.photos.length > 0) {
        for (const photoPath of product.photos) {
          const photoName = photoPath.split("/").pop();
          const path = `uploads/products/${photoName}`;
          try {
            await deleteFile(path);
          } catch (err) {
            console.error(`Failed to delete file: ${err.message}`);
          }
        }
      }
      const variants = await Variant.find({ product: product._id });
      for (const variant of variants) {
        await Option.deleteMany({ variant: variant._id });
        await Variant.findByIdAndDelete(variant._id);
      }
      await Brand.findOneAndUpdate(
        { _id: product.brand },
        { $pull: { products: product._id } },
        { new: true }
      );
      await Product.findByIdAndDelete(product._id);
      res.status(204).json({
        status: "success",
        message: "Product and associated variants & options have been deleted successfully",
        data: null
      });
    });
    exports2.getVariantsByProduct = catchAsync(async (req, res, next) => {
      const { productId } = req.params;
      const product = await Product.findById(productId);
      if (!product) {
        return next(new AppError("No product found with that ID!", 404));
      }
      const variants = await Variant.find({ product: productId }).select("-__v");
      res.status(200).json({
        status: "success",
        results: variants.length,
        data: {
          variants
        }
      });
    });
    exports2.getOptionsByProduct = catchAsync(async (req, res, next) => {
      const { productId } = req.params;
      const product = await Product.findById(productId);
      if (!product) {
        return next(new AppError("No product found with that ID!", 404));
      }
      const query = Option.find({ product: productId }).populate([
        {
          path: "category subCategory brand",
          select: "title"
        },
        {
          path: "product",
          select: "-category -subCategory -brand -variants -__v"
        },
        {
          path: "variant",
          select: "colorName colorCode details"
        }
      ]).select("-__v");
      const features = new APIFeatures(query, req.query).filter().sort().limitFields().paginate();
      const options = await features.query;
      res.status(200).json({
        status: "success",
        results: options.length,
        data: {
          options
        }
      });
    });
  }
});

// routes/api/productRoute.js
var require_productRoute = __commonJS({
  "routes/api/productRoute.js"(exports2, module2) {
    var express = require("express");
    var {
      uploadPhotoMiddleware,
      resizePhotoMiddleware
    } = require_uploadPhotoMiddleware();
    var {
      createProductController,
      getAllProductsController,
      getProductController,
      updateProductController,
      deleteProductController,
      getVariantsByProduct,
      getOptionsByProduct,
      createProductBundleController,
      deleteProductBundleController,
      updateProductBundleController,
      getProductBundleController,
      getAllBundleController
    } = require_productController();
    var router = express.Router();
    router.route("/").post(
      uploadPhotoMiddleware(true, 10),
      resizePhotoMiddleware("products"),
      createProductController
    ).get(getAllProductsController);
    router.route("/bundle").post(
      uploadPhotoMiddleware(true, 10),
      resizePhotoMiddleware("products"),
      createProductBundleController
    ).get(getAllBundleController);
    router.route("/:id").get(getProductController).patch(
      uploadPhotoMiddleware(true, 10),
      resizePhotoMiddleware("products"),
      updateProductController
    ).delete(deleteProductController);
    router.route("/bundle/:id").get(getProductBundleController).patch(
      uploadPhotoMiddleware(true, 10),
      resizePhotoMiddleware("products"),
      updateProductBundleController
    ).delete(deleteProductBundleController);
    router.get("/:productId/variants", getVariantsByProduct);
    router.get("/:productId/options", getOptionsByProduct);
    module2.exports = router;
  }
});

// models/featuredProductModel.js
var require_featuredProductModel = __commonJS({
  "models/featuredProductModel.js"(exports2, module2) {
    var slugify = require("slugify");
    var mongoose2 = require("mongoose");
    var { Schema, model, models } = mongoose2;
    var featuredProductsSchema = new Schema(
      {
        productRef: { type: Schema.Types.ObjectId, ref: "Product" }
      },
      {
        timestamps: true
      }
    );
    var FeaturedProduct = models.FeaturedProduct || model("FeaturedProduct", featuredProductsSchema);
    module2.exports = FeaturedProduct;
  }
});

// controllers/varientController.js
var require_varientController = __commonJS({
  "controllers/varientController.js"(exports2) {
    var FeaturedProduct = require_featuredProductModel();
    var Option = require_optionModel();
    var Product = require_productModel();
    var Variant = require_variantModel();
    var AppError = require_AppError();
    var catchAsync = require_catchAsync();
    var { getAll, getOne, updateOne } = require_handleFactory();
    exports2.createVarientController = catchAsync(async (req, res, next) => {
      const variant = await Variant.create(req.body);
      const product = await Product.findOneAndUpdate(
        { _id: variant.product },
        { $push: { variants: variant._id } },
        { new: true }
      );
      if (!product) {
        return next(new AppError("No prouduct was found with that ID!", 404));
      }
      res.status(201).json({
        status: "success",
        message: "Variant has been created successfully",
        data: {
          variant
        }
      });
    });
    exports2.getAllVarientsController = getAll(Variant, [
      {
        path: "category subCategory childCategory brand",
        select: "title"
      },
      {
        path: "product",
        select: "-category -subCategory -brand -variants -__v"
      },
      {
        path: "options",
        select: "-category -subCategory -brand -product -variant -__v"
      }
    ]);
    exports2.getAllVarientsFeaturedProductController = catchAsync(
      async (req, res, next) => {
        const allFeaturedProduct = await FeaturedProduct.find();
        const productRefIds = allFeaturedProduct.map((product) => product.productRef).filter((ref) => ref);
        const variants = await Variant.find({ product: { $in: productRefIds } }).populate("options").populate("category").populate("subCategory").populate("product");
        res.status(200).json({
          status: "success",
          data: variants
        });
      }
    );
    exports2.getVariantsByProductNameController = catchAsync(
      async (req, res, next) => {
        const productName = req.params.name;
        const product = await Product.findOne({ name: productName });
        if (!product) {
          return res.status(404).json({
            status: "fail",
            message: "Product not found"
          });
        }
        const variants = await Variant.find({ product: product._id }).populate(
          "options"
        );
        res.status(200).json({
          status: "success",
          data: variants
        });
      }
    );
    exports2.getVarientController = getOne(Variant, [
      {
        path: "category subCategory childCategory brand",
        select: "title"
      },
      {
        path: "product",
        select: "-category -subCategory -brand -variants -__v"
      },
      {
        path: "options",
        select: "-category -subCategory -brand -product -variant -__v"
      }
    ]);
    exports2.updateVarientController = updateOne(Variant);
    exports2.deleteVarientController = catchAsync(async (req, res, next) => {
      const variant = await Variant.findByIdAndDelete(req.params.id);
      const product = await Product.findOneAndUpdate(
        { _id: variant.product },
        { $pull: { variants: variant._id } },
        { new: true }
      );
      if (!product) {
        return next(new AppError("No prouduct was found with that ID!", 404));
      }
      await Option.deleteMany({ _id: { $in: variant.options } });
      res.status(204).json({
        status: "success",
        message: "Variant has been deleted successfully",
        data: null
      });
    });
    exports2.getOptionsByVariant = catchAsync(async (req, res, next) => {
      const { variantId } = req.params;
      const variant = await Variant.findById(variantId);
      if (!variant) {
        return next(new AppError("No variant found with that ID!", 404));
      }
      const options = await Option.find({ variant: variantId }).populate([
        {
          path: "category subCategory brand",
          select: "title"
        },
        {
          path: "product",
          select: "-category -subCategory -brand -variants -__v"
        },
        {
          path: "variant",
          select: "colorName colorCode details"
        }
      ]).select("-__v");
      res.status(200).json({
        status: "success",
        results: options.length,
        data: {
          options
        }
      });
    });
  }
});

// routes/api/varientRoute.js
var require_varientRoute = __commonJS({
  "routes/api/varientRoute.js"(exports2, module2) {
    var express = require("express");
    var {
      createVarientController,
      getAllVarientsController,
      getVarientController,
      updateVarientController,
      deleteVarientController,
      getOptionsByVariant,
      getVariantsByProductNameController,
      getAllVarientsFeaturedProductController
    } = require_varientController();
    var router = express.Router();
    router.route("/").post(createVarientController).get(getAllVarientsController);
    router.route("/featuredProduct").get(getAllVarientsFeaturedProductController);
    router.route("/product/:name").get(getVariantsByProductNameController);
    router.route("/:id").get(getVarientController).patch(updateVarientController).delete(deleteVarientController);
    router.get("/:variantId/options", getOptionsByVariant);
    module2.exports = router;
  }
});

// controllers/optionController.js
var require_optionController = __commonJS({
  "controllers/optionController.js"(exports2) {
    var Option = require_optionModel();
    var Variant = require_variantModel();
    var AppError = require_AppError();
    var catchAsync = require_catchAsync();
    var { getOne, getAll, updateOne } = require_handleFactory();
    exports2.createOptionController = catchAsync(async (req, res, next) => {
      try {
        const option = await Option.create(req.body);
        const variant = await Variant.findOneAndUpdate(
          { _id: option.variant },
          { $push: { options: option._id } },
          { new: true }
        );
        if (!variant) {
          return next(new AppError("No variant was found with that ID!", 404));
        }
        res.status(201).json({
          status: "success",
          message: "Option has been created successfully",
          data: {
            option
          }
        });
      } catch (error) {
        console.log("some thing wrong", error);
      }
    });
    exports2.getAllOptionsController = getAll(Option, [
      {
        path: "category subCategory brand",
        select: "title"
      },
      {
        path: "product",
        select: "-category -subCategory -brand -variants -__v"
      },
      {
        path: "variant",
        select: "-category -subCategory -brand -variants -product -options -__v"
      }
    ]);
    exports2.getOptionController = catchAsync(async (req, res, next) => {
      let query = Option.findById(req.params.id).select("-__v");
      const popOptions = [
        {
          path: "category subCategory brand",
          select: "title"
        },
        {
          path: "product",
          select: "-category -subCategory -brand -variants -__v"
        },
        {
          path: "variant",
          select: "-category -subCategory -brand -variants -product -options -__v"
        }
      ];
      if (popOptions) {
        if (Array.isArray(popOptions)) {
          popOptions.forEach((option) => {
            query = query.populate(option);
          });
        } else {
          query = query.populate(popOptions);
        }
      }
      const doc = await query;
      if (!doc) return next(new AppError("No document found with that ID!", 404));
      await Option.findOneAndUpdate(
        { _id: req.params.id },
        { $inc: { visitCount: 1 } },
        { new: true }
      );
      res.status(200).json({
        status: "success",
        data: {
          doc
        }
      });
    });
    exports2.updateOptionController = updateOne(Option);
    exports2.deleteOptionController = catchAsync(async (req, res, next) => {
      const option = await Option.findByIdAndDelete(req.params.id);
      const variant = await Variant.findOneAndUpdate(
        { _id: option.variant },
        { $pull: { options: option._id } },
        { new: true }
      );
      if (!variant) {
        return next(new AppError("No variant was found with that ID!", 404));
      }
      res.status(204).json({
        status: "success",
        message: "Option has been deleted successfully",
        data: null
      });
    });
  }
});

// routes/api/optionRoute.js
var require_optionRoute = __commonJS({
  "routes/api/optionRoute.js"(exports2, module2) {
    var express = require("express");
    var {
      createOptionController,
      getAllOptionsController,
      getOptionController,
      updateOptionController,
      deleteOptionController
    } = require_optionController();
    var router = express.Router();
    router.route("/").post(createOptionController).get(getAllOptionsController);
    router.route("/:id").get(getOptionController).patch(updateOptionController).delete(deleteOptionController);
    module2.exports = router;
  }
});

// models/childCategoryModel.js
var require_childCategoryModel = __commonJS({
  "models/childCategoryModel.js"(exports2, module2) {
    var mongoose2 = require("mongoose");
    var slugify = require("slugify");
    var { Schema, model } = mongoose2;
    var childCategorySchema = new Schema(
      {
        title: {
          type: String,
          required: [true, "Child Category title is required"],
          trim: true
        },
        slug: {
          type: String
        },
        isActive: {
          type: Boolean,
          default: true
        },
        // ব্যাক-রেফারেন্সের জন্য সাব-ক্যাটাগরি আইডি রাখা ভালো (অপশনাল)
        subCategory: {
          type: Schema.Types.ObjectId,
          ref: "SubCategory"
        }
      },
      {
        timestamps: true
      }
    );
    var ChildCategory = model("ChildCategory", childCategorySchema);
    module2.exports = ChildCategory;
  }
});

// controllers/searchController.js
var require_searchController = __commonJS({
  "controllers/searchController.js"(exports2) {
    var AppError = require_AppError();
    var Product = require_productModel();
    var Variant = require_variantModel();
    var Option = require_optionModel();
    var Category = require_categoryModel();
    var SubCategory = require_subCategoryModel();
    var ChildCategory = require_childCategoryModel();
    var catchAsync = require_catchAsync();
    exports2.searchController = catchAsync(async (req, res, next) => {
      const { query } = req.query;
      if (!query) return next(new AppError("Query parameter is required", 400));
      const searchRegex = new RegExp(query, "i");
      const matchedCategories = await Category.find({ title: searchRegex }).select("_id");
      const catIds = matchedCategories.map((c) => c._id);
      const matchedSubCats = await SubCategory.find({ title: searchRegex }).select("_id");
      const subCatIds = matchedSubCats.map((c) => c._id);
      const matchedChildCats = await ChildCategory.find({ title: searchRegex }).select("_id");
      const childCatIds = matchedChildCats.map((c) => c._id);
      const products = await Product.find({
        $or: [
          { name: searchRegex },
          { description: searchRegex },
          { category: { $in: catIds } },
          { subCategory: { $in: subCatIds } },
          { childCategory: { $in: childCatIds } }
        ]
      }).populate("category subCategory childCategory brand", "title").populate({
        path: "variants",
        select: "colorName colorCode options",
        populate: {
          path: "options",
          select: "size price salePrice discountType discountValue"
        }
      }).select("name photos description category subCategory brand variants");
      const variants = await Variant.find({
        $or: [
          { colorName: searchRegex },
          { colorCode: searchRegex },
          { details: searchRegex }
        ]
      }).populate("category subCategory childCategory brand", "title").populate("product", "name photos description").populate("options", "-category -subCategory -brand -variant -__v -product").select("-__v");
      const options = await Option.find({
        size: searchRegex
      }).populate({
        path: "category subCategory childCategory brand",
        select: "title"
      }).populate({
        path: "product",
        select: "name photos description"
      }).populate({
        path: "variant",
        select: "colorName colorCode details"
      }).select("-__v -product -variant");
      const responseData = {};
      if (products.length > 0) responseData.products = products;
      if (variants.length > 0) responseData.variants = variants;
      if (options.length > 0) responseData.options = options;
      const searchResult = products.length + variants.length + options.length;
      if (searchResult < 1)
        return next(new AppError("No Results were found on the server!", 404));
      res.status(200).json({
        status: "success",
        results: searchResult,
        data: responseData
      });
    });
  }
});

// routes/api/searchRoute.js
var require_searchRoute = __commonJS({
  "routes/api/searchRoute.js"(exports2, module2) {
    var express = require("express");
    var { searchController } = require_searchController();
    var router = express.Router();
    router.get("/", searchController);
    module2.exports = router;
  }
});

// models/bannerModel.js
var require_bannerModel = __commonJS({
  "models/bannerModel.js"(exports2, module2) {
    var mongoose2 = require("mongoose");
    var { Schema, model } = mongoose2;
    var bannerSchema = new Schema(
      {
        // title: {
        //   type: String,
        //   required: [true, "Title is required"],
        //   unique: true,
        // },
        // subTitle: {
        //   type: String,
        //   required: [true, "Sub-title is required"],
        // },
        photo: {
          type: String,
          required: [true, "Photo is required"]
        },
        link: {
          type: String,
          // required: [false, ""],
          trim: true
        },
        bannerType: {
          type: String,
          enum: {
            values: ["Main Banner", "Deals of the Week", "New Release"],
            message: "{VALUE} is not supported, Please provide valid banner type"
          },
          required: [true, "Banner type is required"]
        },
        isActive: {
          type: Boolean,
          default: true
        }
      },
      {
        timestamps: true
      }
    );
    var Banner = model("Banner", bannerSchema);
    module2.exports = Banner;
  }
});

// controllers/bannerController.js
var require_bannerController = __commonJS({
  "controllers/bannerController.js"(exports2) {
    var fs = require("fs");
    var Banner = require_bannerModel();
    var AppError = require_AppError();
    var catchAsync = require_catchAsync();
    var { getOne, getAll } = require_handleFactory();
    exports2.createBannerController = catchAsync(async (req, res, next) => {
      const body = req.body;
      if (req.file) {
        const { fieldname } = req.file;
        body[fieldname] = `${req.protocol}://${req.get("host")}/uploads/banner/${req.file.filename}`;
      } else {
        delete body.photo;
      }
      try {
        const banner = await Banner.create(body);
        if (!banner) {
          return next(new AppError("Occured an error while creating banner", 500));
        }
        res.status(201).json({
          status: "success",
          message: "Banner has been added successfully",
          data: {
            banner
          }
        });
      } catch (error) {
        const filePath = `uploads/banner/${req.file.filename}`;
        fs.unlink(filePath, (err) => {
          if (err && req.file)
            return next(
              new AppError("Something gone wrong while creating banner", 500)
            );
        });
        if (error.errors) {
          const messages = Object.values(error.errors).map((item) => item.properties.message).join(", ");
          return next(new AppError(`Validation failed, ${messages}.`, 400));
        } else if (error.code === 11e3) {
          const field = Object.keys(error.keyPattern).join(" ");
          const capitalizeField = field.charAt(0).toUpperCase() + field.slice(1).toLocaleLowerCase();
          const message = `${capitalizeField} already exist, Please use another ${field}.`;
          return next(new AppError(message, 409));
        }
        return next(
          new AppError(`Something went wrong while creating banner`, 400)
        );
      }
    });
    exports2.deleteBannerController = catchAsync(async (req, res, next) => {
      const banner = await Banner.findByIdAndDelete(req.params.id);
      if (!banner) {
        return next(new AppError("No banner was found with that ID!", 404));
      }
      const photoName = banner.photo.split("/");
      const photoPath = `uploads/banner/${photoName[photoName.length - 1]}`;
      fs.unlink(photoPath, (err) => {
        if (err)
          return next(
            new AppError("Something gone wrong while deleting banner", 500)
          );
      });
      res.status(204).json({
        status: "success",
        data: null
      });
    });
    exports2.getBannerController = getOne(Banner);
    exports2.getAllBannerController = getAll(Banner);
  }
});

// routes/api/bannerRoute.js
var require_bannerRoute = __commonJS({
  "routes/api/bannerRoute.js"(exports2, module2) {
    var express = require("express");
    var {
      createBannerController,
      getAllBannerController,
      getBannerController,
      deleteBannerController
    } = require_bannerController();
    var {
      uploadPhotoMiddleware,
      resizePhotoMiddleware
    } = require_uploadPhotoMiddleware();
    var router = express.Router();
    router.route("/").post(
      uploadPhotoMiddleware(),
      resizePhotoMiddleware("banner"),
      createBannerController
    ).get(getAllBannerController);
    router.route("/:id").get(getBannerController).delete(deleteBannerController);
    module2.exports = router;
  }
});

// models/quantityDiscountModel.js
var require_quantityDiscountModel = __commonJS({
  "models/quantityDiscountModel.js"(exports2, module2) {
    var mongoose2 = require("mongoose");
    var quantityDiscountSchema = new mongoose2.Schema({
      minQuantity: { type: Number, required: true },
      discountType: {
        type: String,
        enum: ["percent", "amount", "none"],
        required: true
      },
      discountValue: { type: Number, required: true }
    });
    var QuantityDiscount = mongoose2.model(
      "QuantityDiscount",
      quantityDiscountSchema
    );
    module2.exports = QuantityDiscount;
  }
});

// controllers/discountController.js
var require_discountController = __commonJS({
  "controllers/discountController.js"(exports2) {
    var QuantityDiscount = require_quantityDiscountModel();
    var Option = require_optionModel();
    var AppError = require_AppError();
    var catchAsync = require_catchAsync();
    exports2.addQuantityDiscount = catchAsync(async (req, res, next) => {
      const { discountType, discountValue, minQuantity } = req.body;
      if (!["percent", "amount", "none"].includes(discountType) || discountValue == null || isNaN(discountValue) || discountValue < 0) {
        return next(new AppError("Invalid discount type or value", 400));
      }
      if (!minQuantity || isNaN(minQuantity) || minQuantity <= 0) {
        return next(new AppError("Valid minQuantity is required", 400));
      }
      const existingDiscount = await QuantityDiscount.findOne({ minQuantity });
      if (existingDiscount) {
        return next(
          new AppError(`A discount for Quantity ${minQuantity} already exists`, 400)
        );
      }
      const newDiscount = await QuantityDiscount.create({
        type: "quantity",
        discountType,
        discountValue,
        minQuantity
      });
      res.status(201).json({
        status: "success",
        message: "Quantity discount created successfully",
        data: newDiscount
      });
    });
    exports2.getQuantityDiscount = catchAsync(async (req, res, next) => {
      const quantityDiscounts = await QuantityDiscount.find();
      res.status(200).json({
        status: "success",
        message: "Quantity discounts fetched successfully",
        data: quantityDiscounts
      });
    });
    exports2.deleteQuantityDiscount = catchAsync(async (req, res, next) => {
      const { id } = req.body;
      if (!id) {
        return next(
          new AppError("ID is required to delete the quantity discount", 400)
        );
      }
      const quantityDiscount = await QuantityDiscount.findByIdAndDelete(id);
      if (!quantityDiscount) {
        return next(
          new AppError("No quantity discount found with the provided ID", 404)
        );
      }
      res.status(200).json({
        status: "success",
        message: "Quantity discount deleted successfully"
      });
    });
    exports2.applyDiscountController = catchAsync(async (req, res, next) => {
      let { type, id, discountType, discountValue, minQuantity } = req.body;
      if (!["percent", "amount", "none"].includes(discountType) || discountValue == null || isNaN(discountValue) || discountValue < 0) {
        return next(new AppError("Invalid discount type or value", 400));
      }
      if (!id && type == "percent") {
        return next(new AppError("ID is required to implement discount", 400));
      }
      if (![
        "category",
        "subCategory",
        "brand",
        "product",
        "variant",
        "option",
        "quantity"
      ].includes(type)) {
        return next(
          new AppError(
            "Invalid type, must be category, subCategory, brand, product, variant, option, or quantity",
            400
          )
        );
      }
      if (type === "quantity") {
        if (!minQuantity || isNaN(minQuantity) || minQuantity <= 0) {
          return next(
            new AppError("Valid minQuantity is required for quantity discount", 400)
          );
        }
        const quantityDiscount = await QuantityDiscount.findOneAndUpdate(
          { _id: id },
          // Find based on type and typeId
          { minQuantity, discountType, discountValue },
          // Update these fields
          { new: true, upsert: false }
          // Do not create if not found
        );
        if (!quantityDiscount) {
          return next(new AppError("No existing quantity discount found", 404));
        }
        return res.status(200).json({
          status: "success",
          message: "Quantity discount updated successfully",
          data: quantityDiscount
        });
      }
      let filter;
      if (type === "category") {
        filter = { category: id };
      } else if (type === "subCategory") {
        filter = { subCategory: id };
      } else if (type === "brand") {
        filter = { brand: id };
      } else if (type === "product") {
        filter = { product: id };
      } else if (type === "variant") {
        filter = { variant: id };
      } else if (type === "option") {
        filter = { _id: id };
      }
      const options = await Option.find(filter);
      for (const option of options) {
        const effectivePrice = option.price - (discountType === "percent" ? option.price * discountValue / 100 : discountValue);
        if (effectivePrice <= 0) {
          return next(
            new AppError(
              `Discounted price for ${option.title} cannot be equal to or less than zero`,
              400
            )
          );
        }
      }
      for (const option of options) {
        let salePrice = discountValue === 0 ? 0 : discountType === "percent" ? option.price - option.price * discountValue / 100 : option.price - discountValue;
        await Option.findOneAndUpdate(
          { _id: option._id },
          {
            salePrice,
            discountType: discountValue == 0 ? "none" : discountType,
            discountValue
          },
          { new: true }
        );
      }
      res.status(200).json({
        status: "success",
        message: `Discount applied successfully to all applicable ${type}-based options`
      });
    });
  }
});

// routes/api/discountRoute.js
var require_discountRoute = __commonJS({
  "routes/api/discountRoute.js"(exports2, module2) {
    var express = require("express");
    var {
      applyDiscountController,
      addQuantityDiscount,
      getQuantityDiscount,
      deleteQuantityDiscount
    } = require_discountController();
    var router = express.Router();
    router.route("/apply").post(addQuantityDiscount).put(applyDiscountController).get(getQuantityDiscount).delete(deleteQuantityDiscount);
    module2.exports = router;
  }
});

// models/orderModel.js
var require_orderModel = __commonJS({
  "models/orderModel.js"(exports2, module2) {
    var mongoose2 = require("mongoose");
    var { Schema, model } = mongoose2;
    var orderSchema = new Schema(
      {
        name: {
          type: String,
          required: [true, "Name is required"]
        },
        phone: {
          type: String,
          required: [true, "Phone number is required"]
        },
        email: {
          type: String
          // required: [true, "Email is required"],
        },
        // city: {
        //   cityID: {
        //     type: Number,
        //     required: [true, "City ID is required"],
        //   },
        //   cityName: {
        //     type: String,
        //     required: [true, "City name is required"],
        //   },
        // },
        // zone: {
        //   zoneID: {
        //     type: Number,
        //     required: [true, "Zone ID is required"],
        //   },
        //   zoneName: {
        //     type: String,
        //     required: [true, "Zone name is required"],
        //   },
        // },
        // area: {
        //   areaID: {
        //     type: Number,
        //     required: [true, "Area ID is required"],
        //   },
        //   areaName: {
        //     type: String,
        //     required: [true, "Area name is required"],
        //   },
        // },
        streetAddress: {
          type: String,
          required: [true, "Street address is required"]
        },
        note: {
          type: String
        },
        deliveryType: {
          type: String,
          enum: {
            values: ["normal", "on_demand"],
            // normal --> 48 Hours, on_demand --> 12 Hours
            message: "{VALUE} is not supported, Enter a valid delivery type"
          },
          default: "normal"
        },
        shippingCost: {
          type: Number,
          required: [true, "Shipping cost is required"]
        },
        coupon: {
          type: String,
          default: null
        },
        couponDiscount: {
          type: Number,
          default: 0
        },
        totalCost: {
          type: Number,
          default: 0
        },
        bundleOffer: {
          type: Number
        },
        orderStatus: {
          type: String,
          enum: {
            values: ["pending", "approved", "shipped", "delivered", "canceled"],
            message: "{VALUE} is not supported, Enter a valid order status"
          },
          default: "pending"
        },
        paymentMethod: {
          type: String,
          enum: ["cash_on_delivery", "credit_card"],
          default: "cash_on_delivery"
        },
        courier: {
          type: String,
          default: null
        },
        notes: {
          type: String,
          default: ""
        },
        products: [
          {
            option: {
              type: Schema.Types.ObjectId,
              // Product Option ID
              ref: "Option"
              // required: [true, "Product is required"],
            },
            product: {
              type: Schema.Types.ObjectId,
              // Product Option ID
              ref: "Product"
              // required: [true, "Product is required"],
            },
            quantity: {
              type: Number,
              required: [true, "Quantity is required"]
            }
          }
        ]
      },
      {
        timestamps: true
      }
    );
    var Order = model("Order", orderSchema);
    module2.exports = Order;
  }
});

// models/couponModel.js
var require_couponModel = __commonJS({
  "models/couponModel.js"(exports2, module2) {
    var mongoose2 = require("mongoose");
    var { Schema, model } = mongoose2;
    var couponSchema = new Schema(
      {
        coupon: {
          type: String,
          required: [true, "Coupon code is required"],
          minLength: [5, "Coupon code length must be 5 characters"],
          maxLength: [5, "Coupon code length must be 5 characters"],
          unique: true,
          trim: true
        },
        discountPercent: {
          type: Number,
          required: [true, "Discount percentage is required"],
          min: [0, "Discount percentage must be at least 0"],
          max: [100, "Discount percentage cannot exceed 100"]
        },
        validFrom: {
          type: Date,
          required: [true, "Start date is required"]
        },
        validUntil: {
          type: Date,
          required: [true, "End date is required"],
          validate: {
            validator: function(value) {
              return value >= this.validFrom;
            },
            message: "valid Until date must be after or equal to validFrom date"
          }
        },
        isActive: {
          type: Boolean,
          default: true
        }
      },
      {
        timestamps: true
      }
    );
    var Coupon = model("Coupon", couponSchema);
    module2.exports = Coupon;
  }
});

// controllers/orderController.js
var require_orderController = __commonJS({
  "controllers/orderController.js"(exports2) {
    var mongoose2 = require("mongoose");
    var axios = require("axios");
    var Order = require_orderModel();
    var Option = require_optionModel();
    var Coupon = require_couponModel();
    var Email = require_Email();
    var AppError = require_AppError();
    var catchAsync = require_catchAsync();
    var { getAll, getOne, deleteOne } = require_handleFactory();
    exports2.createOrderController = catchAsync(async (req, res, next) => {
      const productAggregation = await Option.aggregate([
        {
          $match: {
            _id: {
              $in: req.body.products.map(
                (item) => new mongoose2.Types.ObjectId(item.option)
              )
            }
          }
        },
        {
          $project: {
            price: 1,
            salePrice: 1,
            freeShipping: 1
          }
        },
        {
          $addFields: {
            effectivePrice: {
              $cond: {
                if: { $gt: ["$salePrice", 0] },
                then: "$salePrice",
                else: "$price"
              }
            }
          }
        }
      ]);
      console.log("req.body.products", req.body.products);
      console.log("productAggregation", productAggregation);
      let isFreeShipping = false;
      const productTotal = req.body.products.reduce((total, product) => {
        const option = productAggregation.find(
          (v) => v._id.equals(new mongoose2.Types.ObjectId(product.option))
        );
        if (option) {
          if (option.freeShipping === true) isFreeShipping = true;
          return total + option.effectivePrice * product.quantity;
        }
        return total;
      }, 0);
      if (isFreeShipping) req.body.shippingCost = 0;
      const bundleOffer = req.body.bundleOffer || 0;
      const shippingCost = req.body.shippingCost || 0;
      const totalCost = productTotal + shippingCost - bundleOffer;
      let order = await Order.create({
        ...req.body,
        totalCost
      });
      order = await Order.findById(order._id).populate([
        {
          path: "products.option",
          select: "sku size price salePrice discountType discountValue",
          populate: {
            path: "product variant",
            select: "name colorName colorCode"
          }
        },
        {
          path: "products.product",
          select: "name price isBundle"
        }
      ]);
      await Promise.all(
        order.products.map(async (product) => {
          if (product.option && product.option._id) {
            await Option.findByIdAndUpdate(
              product.option._id,
              // Accessing the correct ID
              { $inc: { saleNumber: product.quantity } },
              { new: true }
            );
          }
        })
      );
      if (order?.email) {
        const orderUrl = `${req.protocol}://localhost:5173/orders/${order._id}`;
        const email = new Email(
          { email: order?.email, name: order?.name },
          orderUrl
        );
        try {
          await email.sendInvoice(order);
        } catch (err) {
          console.error("Failed to send order invoice email:", err);
        }
      }
      res.status(201).json({
        status: "success",
        message: "Order request sent successfully, Check your email inbox please",
        data: {
          order
        }
      });
    });
    exports2.createOrderWithCouponController = catchAsync(async (req, res, next) => {
      const { coupon, products } = req.body;
      if (!coupon) {
        return next(
          new AppError("You need to enter a coupon code to use this route", 400)
        );
      }
      const couponData = await Coupon.findOne({
        coupon,
        isActive: true,
        validFrom: { $lte: /* @__PURE__ */ new Date() },
        validUntil: { $gte: /* @__PURE__ */ new Date() }
      });
      if (!couponData) {
        return next(new AppError("Invalid, inactive, or expired coupon code", 400));
      }
      const productAggregation = await Option.aggregate([
        {
          $match: {
            _id: {
              $in: products.map((item) => new mongoose2.Types.ObjectId(item.option))
            }
          }
        },
        {
          $project: {
            price: 1,
            salePrice: 1,
            freeShipping: 1
          }
        }
      ]);
      let isFreeShipping = false;
      const productTotal = products.reduce((total, product) => {
        const option = productAggregation.find(
          (v) => v._id.equals(new mongoose2.Types.ObjectId(product.option))
        );
        if (option) {
          if (option.freeShipping === true) isFreeShipping = true;
          return total + option.price * product.quantity;
        }
        return total;
      }, 0);
      const couponDiscount = productTotal * couponData.discountPercent / 100;
      const discountedProductTotal = productTotal - couponDiscount;
      if (isFreeShipping) req.body.shippingCost = 0;
      const totalCost = discountedProductTotal + req.body.shippingCost;
      let order = await Order.create({
        ...req.body,
        totalCost,
        couponDiscount
      });
      order = await Order.findById(order._id).populate([
        {
          path: "products.option",
          select: "sku size price salePrice discountType discountValue",
          populate: {
            path: "product variant",
            select: "name colorName colorCode"
          }
        },
        {
          path: "products.product",
          select: "name price isBundle"
        }
      ]).select("-__v");
      await Promise.all(
        order.products.map(async (product) => {
          if (product.option && product.option._id) {
            await Option.findByIdAndUpdate(
              product.option._id,
              { $inc: { saleNumber: product.quantity } },
              { new: true }
            );
          }
        })
      );
      const orderUrl = `${req.protocol}://localhost:5173/orders/${order._id}`;
      const email = new Email({ email: order.email, name: order.name }, orderUrl);
      try {
        await email.sendInvoiceWithCoupon(order, couponData.discountPercent);
      } catch (err) {
        console.error("Failed to send order invoice with coupon email:", err);
      }
      res.status(201).json({
        status: "success",
        message: "Order request sent successfully, Check your email inbox please",
        data: {
          order
        }
      });
    });
    exports2.getAllOrdersController = getAll(Order, [
      {
        path: "products.option",
        select: "-__v",
        populate: {
          path: "category subCategory brand product variant",
          select: "title name colorName colorCode"
        }
      },
      {
        path: "products.product",
        select: "name price isBundle"
      }
    ]);
    exports2.getOrderController = getOne(Order, [
      {
        path: "products.option",
        select: "-__v",
        populate: {
          path: "category subCategory brand product variant",
          select: "title name colorName colorCode"
        }
      },
      {
        path: "products.product",
        select: "name price isBundle"
      }
    ]);
    exports2.updateOrderController = catchAsync(async (req, res, next) => {
      const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
      }).populate([
        {
          path: "products.option",
          select: "sku size price salePrice discountType discountValue",
          populate: {
            path: "product variant",
            select: "name colorName colorCode"
          }
        },
        {
          path: "products.product",
          select: "name price isBundle"
        }
      ]).select("-__v");
      if (!order) return next(new AppError("No order found with that ID!", 404));
      const orderUrl = `${req.protocol}://localhost:5173/orders/${order._id}`;
      const email = new Email({ email: order.email, name: order.name }, orderUrl);
      const { orderStatus } = req.body;
      if (["approved", "delivered", "shipped", "canceled"].includes(orderStatus)) {
        try {
          await email.sendInvoice(order);
        } catch (err) {
          console.error("Failed to send order invoice email:", err);
        }
      }
      res.status(200).json({
        status: "success",
        message: "Order has been updated successfully",
        data: {
          order
        }
      });
    });
    exports2.deleteOrderController = deleteOne(Order);
    exports2.shipSteadfastOrderController = catchAsync(async (req, res, next) => {
      const order = await Order.findById(req.params.id);
      if (!order) return next(new AppError("No order found with that ID!", 404));
      const { name, phone, streetAddress, totalCost, bundleOffer } = order;
      const invoice = `${order._id.toString().slice(-6)}`;
      const bundleDiscount = Math.round(bundleOffer || 0);
      const grandTotal = Math.round(totalCost - bundleDiscount);
      const codAmount = grandTotal > 0 ? grandTotal : 0;
      const payload = {
        invoice,
        recipient_name: name,
        recipient_phone: phone,
        recipient_address: streetAddress,
        cod_amount: codAmount,
        note: order.notes || ""
      };
      const baseUrl = (process.env.STEADFAST_BASE_URL || process.env.STEEDFAST_BASE_URL || process.env["STEADFAST_BASE_URL "] || process.env["STEEDFAST_BASE_URL "] || "https://portal.packzy.com/api/v1").trim();
      const apiKey = (process.env.STEADFAST_API_KEY || process.env.STEEDFAST_API_KEY || process.env["STEADFAST_API_KEY "] || process.env["STEEDFAST_API_KEY "] || "").trim();
      const secretKey = (process.env.STEADFAST_SECRET_KEY || process.env.STEEDFAST_SECRET_KEY || process.env["STEADFAST_SECRET_KEY "] || process.env["STEEDFAST_SECRET_KEY "] || "").trim();
      let response;
      try {
        response = await axios.post(
          `${baseUrl}/create_order`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              "Api-Key": apiKey,
              "Secret-Key": secretKey
            }
          }
        );
      } catch (error) {
        console.error("Steadfast API call failed:", error.response?.data || error.message);
        const apiError = error.response?.data?.message || error.response?.data?.errors || error.message;
        return next(new AppError(`Steadfast API error: ${typeof apiError === "object" ? JSON.stringify(apiError) : apiError}`, 400));
      }
      if (response?.data?.status !== 200) {
        const errorDetails = response?.data?.errors;
        const errorMsg = errorDetails ? typeof errorDetails === "object" ? JSON.stringify(errorDetails) : errorDetails : "Failed to create order with Steadfast";
        return next(new AppError(errorMsg, 400));
      }
      order.courier = "Steadfast";
      order.orderStatus = "shipped";
      await order.save();
      const orderUrl = `${req.protocol}://localhost:5173/orders/${order._id}`;
      const email = new Email({ email: order.email, name: order.name }, orderUrl);
      try {
        const populatedOrder = await Order.findById(order._id).populate([
          {
            path: "products.option",
            select: "sku size price salePrice discountType discountValue",
            populate: {
              path: "product variant",
              select: "name colorName colorCode"
            }
          },
          {
            path: "products.product",
            select: "name price isBundle"
          }
        ]);
        await email.sendInvoice(populatedOrder);
      } catch (err) {
        console.error("Failed to send order invoice email:", err);
      }
      res.status(200).json({
        status: "success",
        message: "Order placed with Steadfast successfully",
        data: {
          order
        }
      });
    });
  }
});

// routes/api/orderRoute.js
var require_orderRoute = __commonJS({
  "routes/api/orderRoute.js"(exports2, module2) {
    var express = require("express");
    var {
      createOrderWithCouponController,
      createOrderController,
      getAllOrdersController,
      getOrderController,
      updateOrderController,
      deleteOrderController,
      shipSteadfastOrderController
    } = require_orderController();
    var router = express.Router();
    router.route("/withCoupon").post(createOrderWithCouponController);
    router.route("/ship-steadfast/:id").post(shipSteadfastOrderController);
    router.route("/").post(createOrderController).get(getAllOrdersController);
    router.route("/:id").get(getOrderController).patch(updateOrderController).delete(deleteOrderController);
    module2.exports = router;
  }
});

// controllers/couponController.js
var require_couponController = __commonJS({
  "controllers/couponController.js"(exports2) {
    var Coupon = require_couponModel();
    var AppError = require_AppError();
    var catchAsync = require_catchAsync();
    var { createOne, getAll } = require_handleFactory();
    exports2.createCouponCodeController = createOne(Coupon);
    exports2.getAllCouponCodeController = getAll(Coupon);
    exports2.getCouponCodeController = catchAsync(async (req, res, next) => {
      let coupon = await Coupon.findOne({ coupon: req.params.coupon }).select(
        "-__v"
      );
      if (!coupon) {
        return next(new AppError("No coupon was found with that name!", 404));
      }
      res.status(200).json({
        status: "success",
        data: {
          coupon
        }
      });
    });
    exports2.updateCouponCodeController = catchAsync(async (req, res, next) => {
      const coupon = await Coupon.findOneAndUpdate(
        { coupon: req.params.coupon },
        req.body,
        {
          new: true,
          runValidators: true
        }
      ).select("-__v");
      if (!coupon) {
        return next(new AppError("No coupon was found with that name!", 404));
      }
      res.status(200).json({
        status: "success",
        message: "Coupon has been updated successfully",
        data: {
          coupon
        }
      });
    });
    exports2.deleteCouponCodeController = catchAsync(async (req, res, next) => {
      const coupon = await Coupon.findOneAndDelete({ _id: req.params.coupon });
      if (!coupon) {
        return next(new AppError("No coupon was found with that name!", 404));
      }
      res.status(204).json({
        status: "success",
        data: null
      });
    });
  }
});

// routes/api/couponRoute.js
var require_couponRoute = __commonJS({
  "routes/api/couponRoute.js"(exports2, module2) {
    var express = require("express");
    var {
      createCouponCodeController,
      getAllCouponCodeController,
      getCouponCodeController,
      deleteCouponCodeController,
      updateCouponCodeController
    } = require_couponController();
    var router = express.Router();
    router.route("/").post(createCouponCodeController).get(getAllCouponCodeController);
    router.route("/:coupon").get(getCouponCodeController).patch(updateCouponCodeController).delete(deleteCouponCodeController);
    module2.exports = router;
  }
});

// controllers/pathawLocationController.js
var require_pathawLocationController = __commonJS({
  "controllers/pathawLocationController.js"(exports2) {
    var axios = require("axios");
    var AppError = require_AppError();
    var catchAsync = require_catchAsync();
    exports2.createPathaoOrderController = catchAsync(async (req, res, next) => {
      const tokenResponse = await axios.post(
        `${process.env.PATHAO_BASE_URL}/aladdin/api/v1/issue-token`,
        {
          client_id: process.env.PATHAO_CLIENT_ID,
          client_secret: process.env.PATHAO_CLIENT_SECRET,
          username: process.env.PATHAO_EMAIL,
          password: process.env.PATHAO_PASS,
          grant_type: process.env.PATHAO_GRANT
        },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          }
        }
      );
      if (!tokenResponse.data.access_token) {
        return next(new AppError("Failed to retrieve access token", 400));
      }
      const accessToken = tokenResponse.data.access_token;
      const {
        merchant_order_id,
        recipient_name,
        recipient_phone,
        recipient_city,
        recipient_zone,
        delivery_type,
        item_type,
        item_quantity,
        item_weight,
        amount_to_collect,
        recipient_address
      } = req.body;
      const payload = {
        store_id: parseInt(process.env.STORE_ID),
        merchant_order_id: merchant_order_id || "",
        recipient_name,
        recipient_phone,
        recipient_city: parseInt(recipient_city),
        recipient_zone: parseInt(recipient_zone),
        delivery_type,
        item_type,
        item_quantity: parseInt(item_quantity),
        item_weight: parseFloat(item_weight),
        amount_to_collect: parseInt(amount_to_collect),
        recipient_address
      };
      const orderResponse = await axios.post(
        `${process.env.PATHAO_BASE_URL}/aladdin/api/v1/orders`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            Accept: "application/json"
          }
        }
      );
      if (orderResponse.data.type !== "success") {
        return next(new AppError("Failed to create Pathao order", 400));
      }
      res.status(200).json({
        status: "success",
        data: {
          order: orderResponse.data.data
        }
      });
    });
    exports2.pathaoZoneController = catchAsync(async (req, res, next) => {
      const id = req.params.id;
      const city_id = parseInt(id);
      const response = await axios.post(
        `${process.env.PATHAO_BASE_URL}/aladdin/api/v1/issue-token`,
        {
          client_id: process.env.PATHAO_CLIENT_ID,
          client_secret: process.env.PATHAO_CLIENT_SECRET,
          username: process.env.PATHAO_EMAIL,
          password: process.env.PATHAO_PASS,
          grant_type: process.env.PATHAO_GRANT
        },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          }
        }
      );
      if (!response.data.access_token) {
        return next(new AppError("Access token not received yet", 400));
      }
      const reqZone = await axios.get(
        `${process.env.PATHAO_BASE_URL}/aladdin/api/v1/cities/${city_id}/zone-list`,
        {
          headers: {
            Authorization: `Bearer ${response.data.access_token}`,
            "Content-Type": "application/json",
            Accept: "application/json"
          }
        }
      );
      res.status(200).json({
        status: "success",
        data: {
          ...reqZone.data.data
        }
      });
    });
    exports2.pathaoAreaController = catchAsync(async (req, res, next) => {
      const id = req.params.id;
      const zone_id = parseInt(id);
      const response = await axios.post(
        `${process.env.PATHAO_BASE_URL}/aladdin/api/v1/issue-token`,
        {
          client_id: process.env.PATHAO_CLIENT_ID,
          client_secret: process.env.PATHAO_CLIENT_SECRET,
          username: process.env.PATHAO_EMAIL,
          password: process.env.PATHAO_PASS,
          grant_type: process.env.PATHAO_GRANT
        },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          }
        }
      );
      if (!response.data.access_token) {
        return next(new AppError("Access token not received yet", 400));
      }
      const reqArea = await axios.get(
        `${process.env.PATHAO_BASE_URL}/aladdin/api/v1/zones/${zone_id}/area-list`,
        {
          headers: {
            Authorization: `Bearer ${response.data.access_token}`,
            "Content-Type": "application/json",
            Accept: "application/json"
          }
        }
      );
      res.status(200).json({
        status: "success",
        data: {
          ...reqArea.data.data
        }
      });
    });
  }
});

// routes/api/pathaoLocationRoute.js
var require_pathaoLocationRoute = __commonJS({
  "routes/api/pathaoLocationRoute.js"(exports2, module2) {
    var express = require("express");
    var {
      pathaoZoneController,
      pathaoAreaController,
      createPathaoOrderController
    } = require_pathawLocationController();
    var router = express.Router();
    router.post("/city/:id/zones", pathaoZoneController);
    router.post("/create-order", createPathaoOrderController);
    router.post("/zone/:id/area-list", pathaoAreaController);
    module2.exports = router;
  }
});

// controllers/featuredProductController.js
var require_featuredProductController = __commonJS({
  "controllers/featuredProductController.js"(exports2) {
    var fs = require("fs");
    var Brand = require_brandModel();
    var Variant = require_variantModel();
    var Option = require_optionModel();
    var APIFeatures = require_APIFeatures();
    var AppError = require_AppError();
    var catchAsync = require_catchAsync();
    var deleteFile = require_deleteFile();
    var { getAll, getOne } = require_handleFactory();
    var FeaturedProduct = require_featuredProductModel();
    exports2.createFeaturedProductController = catchAsync(async (req, res, next) => {
      const body = req.body;
      const { id } = body;
      try {
        const existingProduct = await FeaturedProduct.findOne({ productRef: id });
        if (existingProduct) {
          const data = await FeaturedProduct.deleteOne({
            _id: existingProduct._id
          });
          return res.status(200).json({
            status: "success",
            message: "FeaturedProduct has been deleted successfully"
          });
        } else {
          const product = await FeaturedProduct.create({
            productRef: id
          });
          return res.status(201).json({
            status: "success",
            message: "FeaturedProduct has been created successfully",
            data: {
              product
            }
          });
        }
      } catch (error) {
        return res.status(400).json({
          status: "fail",
          message: "Error processing FeaturedProduct",
          error: error.message
        });
      }
    });
    exports2.createFeaturedProductBundleController = catchAsync(
      async (req, res, next) => {
        const body = req.body;
        const isLocalhost = req.get("host").includes("localhost");
        const protocol = isLocalhost ? "http" : "https";
        if (req.files && req.files.length > 0) {
          body.photos = req.files.map((file) => {
            const url = `${protocol}://${req.get("host")}/uploads/products/${file.filename}`;
            return url;
          });
        } else {
          delete body.photos;
        }
        if (body.videoUrl && body.videoUrl) {
          body.photos = body.photos || [];
          body.photos.push(body.videoUrl);
        }
        if (body.videoUrl) {
          return next(
            new AppError("Invalid link, Please provide a valid YouTube URL", 400)
          );
        }
        try {
          if (body?.brand == "undefined") {
            delete body.brand;
          }
          const product = await FeaturedProduct.create(body);
          const brand = await Brand.findOneAndUpdate(
            { _id: product?.brand },
            {
              $push: { products: product._id }
            },
            { new: true }
          );
          res.status(201).json({
            status: "success",
            message: "FeaturedProduct has been created successfully",
            data: {
              product
            }
          });
        } catch (error) {
          if (error.errors) {
            const messages = Object.values(error.errors).map((item) => item.properties.message).join(", ");
            return next(new AppError(`Validation failed, ${messages}.`, 400));
          } else if (error.code === 11e3) {
            const field = Object.keys(error.keyPattern).join(" ");
            const capitalizeField = field.charAt(0).toUpperCase() + field.slice(1).toLocaleLowerCase();
            const message = `${capitalizeField} already exist, Please use another ${field}.`;
            return next(new AppError(message, 409));
          }
          if (req.files && req.files.length > 0) {
            req.files.forEach((file) => {
              const filePath = `uploads/products/${file.fileName}`;
              fs.unlink(filePath, (err) => {
                if (err) {
                  return next(
                    new AppError(`Error removing file: ${filePath}`, 500)
                  );
                }
              });
            });
          }
          return next(
            new AppError(`Something went wrong while creating varient`, 400)
          );
        }
      }
    );
    exports2.getAllFeaturedProductsController = catchAsync(
      async (req, res, next) => {
        const allFeaturedProduct = await FeaturedProduct.find().populate([
          {
            path: "productRef"
            // select: "category -subCategory -brand -product -__v",
          }
        ]);
        res.status(200).json({
          status: "success",
          message: "FeaturedProduct has been updated successfully",
          data: {
            allFeaturedProduct
          }
        });
      }
    );
    exports2.getAllBundleController = catchAsync(async (req, res, next) => {
      const allFeaturedProduct = await FeaturedProduct.find().populate([
        {
          path: "category subCategory brand",
          select: "title"
        },
        {
          path: "bundleFeaturedProducts",
          select: "name"
        },
        {
          path: "variants",
          select: "-category -subCategory -brand -product -__v",
          populate: {
            path: "options",
            select: "size price stock"
          }
        }
        // {
        //   path: "variants.options",
        //   // select: "category -subCategory -brand -product -__v",
        // },
      ]);
      res.status(200).json({
        status: "success",
        message: "FeaturedProduct has been updated successfully",
        data: {
          allFeaturedProduct
        }
      });
    });
    exports2.getFeaturedProductController = getOne(FeaturedProduct, [
      {
        path: "category subCategory brand",
        select: "title"
      },
      {
        path: "bundleFeaturedProducts",
        select: "name photos"
      },
      {
        path: "variants",
        select: "-category -subCategory -brand -product -__v",
        populate: {
          path: "options",
          select: "-category -subCategory -brand -product -variant -__v"
        }
      }
    ]);
    exports2.getFeaturedProductBundleController = getOne(FeaturedProduct, [
      {
        path: "category subCategory brand",
        select: "title"
      },
      {
        path: "variants",
        select: "-category -subCategory -brand -product -__v",
        populate: {
          path: "options",
          select: "-category -subCategory -brand -product -variant -__v"
        }
      }
    ]);
    exports2.updateFeaturedProductController = catchAsync(async (req, res, next) => {
      const product = await FeaturedProduct.findById(req.params.id);
      if (!product) {
        return next(new AppError("No product was found with that ID!", 404));
      }
      const body = req.body;
      if (req.files && req.files.length > 0) {
        if (product.photos && product.photos.length > 0) {
          for (const photoPath of product.photos) {
            const photoName = photoPath.split("/").pop();
            const path = `uploads/products/${photoName}`;
            try {
              await deleteFile(path);
            } catch (err) {
              console.error(`Failed to delete file: ${err.message}`);
            }
          }
        }
        body.photos = req.files.map(
          (file) => `${req.protocol}://${req.get("host")}/uploads/products/${file.filename}`
        );
      }
      const isValidYouTubeUrl = (url) => {
        const regex = /^https:\/\/www\.youtube\.com\/embed\/[a-zA-Z0-9_-]{11}\?si=[a-zA-Z0-9_-]+$/;
        return regex.test(url);
      };
      if (body.videoUrl) {
        if (!isValidYouTubeUrl(body.videoUrl)) {
          return next(
            new AppError("Invalid link, Please provide a valid YouTube URL", 400)
          );
        }
        if (!product.photos.includes(body.videoUrl)) {
          if (body.photos) {
            body.photos.push(body.videoUrl);
          } else {
            product.photos = product.photos || [];
            product.photos.push(body.videoUrl);
          }
        }
      }
      Object.keys(body).forEach((key) => {
        product[key] = body[key];
      });
      await product.save();
      res.status(200).json({
        status: "success",
        message: "FeaturedProduct has been updated successfully",
        data: {
          product
        }
      });
    });
    exports2.updateFeaturedProductController = catchAsync(async (req, res, next) => {
      const product = await FeaturedProduct.findById(req.params.id);
      if (!product) {
        return next(new AppError("No product was found with that ID!", 404));
      }
      const body = req.body;
      if (req.files && req.files.length > 0) {
        if (product.photos && product.photos.length > 0) {
          for (const photoPath of product.photos) {
            const photoName = photoPath.split("/").pop();
            const path = `uploads/products/${photoName}`;
            try {
              await deleteFile(path);
            } catch (err) {
              console.error(`Failed to delete file: ${err.message}`);
            }
          }
        }
        body.photos = req.files.map(
          (file) => `${req.protocol}://${req.get("host")}/uploads/products/${file.filename}`
        );
      }
      const isValidYouTubeUrl = (url) => {
        const regex = /^https:\/\/www\.youtube\.com\/embed\/[a-zA-Z0-9_-]{11}\?si=[a-zA-Z0-9_-]+$/;
        return regex.test(url);
      };
      if (body.videoUrl) {
        if (!isValidYouTubeUrl(body.videoUrl)) {
          return next(
            new AppError("Invalid link, Please provide a valid YouTube URL", 400)
          );
        }
        if (!product.photos.includes(body.videoUrl)) {
          if (body.photos) {
            body.photos.push(body.videoUrl);
          } else {
            product.photos = product.photos || [];
            product.photos.push(body.videoUrl);
          }
        }
      }
      Object.keys(body).forEach((key) => {
        product[key] = body[key];
      });
      await product.save();
      res.status(200).json({
        status: "success",
        message: "FeaturedProduct has been updated successfully",
        data: {
          product
        }
      });
    });
    exports2.updateFeaturedProductBundleController = catchAsync(
      async (req, res, next) => {
        const product = await FeaturedProduct.findById(req.params.id);
        if (!product) {
          return next(new AppError("No product was found with that ID!", 404));
        }
        const body = req.body;
        if (req.files && req.files.length > 0) {
          if (product.photos && product.photos.length > 0) {
            for (const photoPath of product.photos) {
              const photoName = photoPath.split("/").pop();
              const path = `uploads/products/${photoName}`;
              try {
                await deleteFile(path);
              } catch (err) {
                console.error(`Failed to delete file: ${err.message}`);
              }
            }
          }
          body.photos = req.files.map(
            (file) => `${req.protocol}://${req.get("host")}/uploads/products/${file.filename}`
          );
        }
        const isValidYouTubeUrl = (url) => {
          const regex = /^https:\/\/www\.youtube\.com\/embed\/[a-zA-Z0-9_-]{11}\?si=[a-zA-Z0-9_-]+$/;
          return regex.test(url);
        };
        if (body.videoUrl) {
          if (!isValidYouTubeUrl(body.videoUrl)) {
            return next(
              new AppError("Invalid link, Please provide a valid YouTube URL", 400)
            );
          }
          if (!product.photos.includes(body.videoUrl)) {
            if (body.photos) {
              body.photos.push(body.videoUrl);
            } else {
              product.photos = product.photos || [];
              product.photos.push(body.videoUrl);
            }
          }
        }
        Object.keys(body).forEach((key) => {
          product[key] = body[key];
        });
        await product.save();
        res.status(200).json({
          status: "success",
          message: "FeaturedProduct has been updated successfully",
          data: {
            product
          }
        });
      }
    );
    exports2.deleteFeaturedProductController = catchAsync(async (req, res, next) => {
      const product = await FeaturedProduct.findById(req.params.id);
      if (!product) {
        return next(new AppError("No product was found with that ID!", 404));
      }
      if (product.photos && product.photos.length > 0) {
        for (const photoPath of product.photos) {
          const photoName = photoPath.split("/").pop();
          const path = `uploads/products/${photoName}`;
          try {
            await deleteFile(path);
          } catch (err) {
            console.error(`Failed to delete file: ${err.message}`);
          }
        }
      }
      const variants = await Variant.find({ product: product._id });
      for (const variant of variants) {
        await Option.deleteMany({ variant: variant._id });
        await Variant.findByIdAndDelete(variant._id);
      }
      await Brand.findOneAndUpdate(
        { _id: product.brand },
        { $pull: { products: product._id } },
        { new: true }
      );
      await FeaturedProduct.findByIdAndDelete(product._id);
      res.status(204).json({
        status: "success",
        message: "FeaturedProduct and associated variants & options have been deleted successfully",
        data: null
      });
    });
    exports2.deleteFeaturedProductBundleController = catchAsync(
      async (req, res, next) => {
        const product = await FeaturedProduct.findById(req.params.id);
        if (!product) {
          return next(new AppError("No product was found with that ID!", 404));
        }
        if (product.photos && product.photos.length > 0) {
          for (const photoPath of product.photos) {
            const photoName = photoPath.split("/").pop();
            const path = `uploads/products/${photoName}`;
            try {
              await deleteFile(path);
            } catch (err) {
              console.error(`Failed to delete file: ${err.message}`);
            }
          }
        }
        const variants = await Variant.find({ product: product._id });
        for (const variant of variants) {
          await Option.deleteMany({ variant: variant._id });
          await Variant.findByIdAndDelete(variant._id);
        }
        await Brand.findOneAndUpdate(
          { _id: product.brand },
          { $pull: { products: product._id } },
          { new: true }
        );
        await FeaturedProduct.findByIdAndDelete(product._id);
        res.status(204).json({
          status: "success",
          message: "FeaturedProduct and associated variants & options have been deleted successfully",
          data: null
        });
      }
    );
    exports2.getVariantsByFeaturedProduct = catchAsync(async (req, res, next) => {
      const { productId } = req.params;
      const product = await FeaturedProduct.findById(productId);
      if (!product) {
        return next(new AppError("No product found with that ID!", 404));
      }
      const variants = await Variant.find({ product: productId }).select("-__v");
      res.status(200).json({
        status: "success",
        results: variants.length,
        data: {
          variants
        }
      });
    });
    exports2.getOptionsByFeaturedProduct = catchAsync(async (req, res, next) => {
      const { productId } = req.params;
      const product = await FeaturedProduct.findById(productId);
      if (!product) {
        return next(new AppError("No product found with that ID!", 404));
      }
      const query = Option.find({ product: productId }).populate([
        {
          path: "category subCategory brand",
          select: "title"
        },
        {
          path: "product",
          select: "-category -subCategory -brand -variants -__v"
        },
        {
          path: "variant",
          select: "colorName colorCode details"
        }
      ]).select("-__v");
      const features = new APIFeatures(query, req.query).filter().sort().limitFields().paginate();
      const options = await features.query;
      res.status(200).json({
        status: "success",
        results: options.length,
        data: {
          options
        }
      });
    });
  }
});

// routes/api/featuredProductRoute.js
var require_featuredProductRoute = __commonJS({
  "routes/api/featuredProductRoute.js"(exports2, module2) {
    var express = require("express");
    var {
      uploadPhotoMiddleware,
      resizePhotoMiddleware
    } = require_uploadPhotoMiddleware();
    var {
      createFeaturedProductController,
      getAllFeaturedProductsController,
      getFeaturedProductController,
      updateFeaturedProductController,
      deleteFeaturedProductController,
      getVariantsByFeaturedProduct,
      getOptionsByFeaturedProduct,
      createFeaturedProductBundleController,
      deleteFeaturedProductBundleController,
      updateFeaturedProductBundleController,
      getFeaturedProductBundleController,
      getAllBundleController
    } = require_featuredProductController();
    var router = express.Router();
    router.route("/").post(
      createFeaturedProductController
    ).get(getAllFeaturedProductsController);
    module2.exports = router;
  }
});

// models/landingBannerModel.js
var require_landingBannerModel = __commonJS({
  "models/landingBannerModel.js"(exports2, module2) {
    var slugify = require("slugify");
    var mongoose2 = require("mongoose");
    var { Schema, model } = mongoose2;
    var landingBannerSchema = new Schema(
      {
        photo: {
          type: String
        }
      },
      {
        timestamps: true
      }
    );
    var LandingBanner = model("LandingBanner", landingBannerSchema);
    module2.exports = LandingBanner;
  }
});

// controllers/landingBannerController.js
var require_landingBannerController = __commonJS({
  "controllers/landingBannerController.js"(exports2) {
    var fs = require("fs");
    var AppError = require_AppError();
    var catchAsync = require_catchAsync();
    var { getOne, getAll } = require_handleFactory();
    var LandingBanner = require_landingBannerModel();
    exports2.createLandingBannerController = catchAsync(async (req, res, next) => {
      const body = req.body;
      if (req.file) {
        const { fieldname } = req.file;
        body[fieldname] = `${req.protocol}://${req.get("host")}/uploads/banner/${req.file.filename}`;
      } else {
        delete body.photo;
      }
      try {
        const banner = await LandingBanner.create(body);
        if (!banner) {
          return next(new AppError("Occured an error while creating banner", 500));
        }
        res.status(201).json({
          status: "success",
          message: "LandingBanner has been added successfully",
          data: {
            banner
          }
        });
      } catch (error) {
        const filePath = `uploads/banner/${req.file.filename}`;
        fs.unlink(filePath, (err) => {
          if (err && req.file)
            return next(
              new AppError("Something gone wrong while creating banner", 500)
            );
        });
        if (error.errors) {
          const messages = Object.values(error.errors).map((item) => item.properties.message).join(", ");
          return next(new AppError(`Validation failed, ${messages}.`, 400));
        } else if (error.code === 11e3) {
          const field = Object.keys(error.keyPattern).join(" ");
          const capitalizeField = field.charAt(0).toUpperCase() + field.slice(1).toLocaleLowerCase();
          const message = `${capitalizeField} already exist, Please use another ${field}.`;
          return next(new AppError(message, 409));
        }
        return next(
          new AppError(`Something went wrong while creating banner`, 400)
        );
      }
    });
    exports2.deleteLandingBannerController = catchAsync(async (req, res, next) => {
      const banner = await LandingBanner.findByIdAndDelete(req.params.id);
      if (!banner) {
        return next(new AppError("No banner was found with that ID!", 404));
      }
      const photoName = banner.photo.split("/");
      const photoPath = `uploads/banner/${photoName[photoName.length - 1]}`;
      fs.unlink(photoPath, (err) => {
        if (err)
          return next(
            new AppError("Something gone wrong while deleting banner", 500)
          );
      });
      res.status(204).json({
        status: "success",
        data: null
      });
    });
    exports2.getLandingBannerController = getOne(LandingBanner);
    exports2.getAllLandingBannerController = getAll(LandingBanner);
  }
});

// routes/api/landingBannerRoute.js
var require_landingBannerRoute = __commonJS({
  "routes/api/landingBannerRoute.js"(exports2, module2) {
    var express = require("express");
    var {
      createLandingBannerController,
      getAllLandingBannerController,
      getLandingBannerController,
      deleteLandingBannerController
    } = require_landingBannerController();
    var {
      uploadPhotoMiddleware,
      resizePhotoMiddleware
    } = require_uploadPhotoMiddleware();
    var router = express.Router();
    router.route("/").post(
      uploadPhotoMiddleware(),
      resizePhotoMiddleware("banner"),
      createLandingBannerController
    ).get(getAllLandingBannerController);
    router.route("/:id").get(getLandingBannerController).delete(deleteLandingBannerController);
    module2.exports = router;
  }
});

// models/landingCoustomerReviewModel.js
var require_landingCoustomerReviewModel = __commonJS({
  "models/landingCoustomerReviewModel.js"(exports2, module2) {
    var slugify = require("slugify");
    var mongoose2 = require("mongoose");
    var { Schema, model } = mongoose2;
    var landingCustomerReviewSchema = new Schema(
      {
        photo: {
          type: String
        }
      },
      {
        timestamps: true
      }
    );
    var LandingCustomerReview = model("LandingCustomerReview", landingCustomerReviewSchema);
    module2.exports = LandingCustomerReview;
  }
});

// controllers/landingCustomerReviewController.js
var require_landingCustomerReviewController = __commonJS({
  "controllers/landingCustomerReviewController.js"(exports2) {
    var fs = require("fs");
    var AppError = require_AppError();
    var catchAsync = require_catchAsync();
    var { getOne, getAll } = require_handleFactory();
    var LandingCustomerReview = require_landingCoustomerReviewModel();
    exports2.createLandingCustomerReviewController = catchAsync(async (req, res, next) => {
      const body = req.body;
      if (req.file) {
        const { fieldname } = req.file;
        body[fieldname] = `${req.protocol}://${req.get("host")}/uploads/banner/${req.file.filename}`;
      } else {
        delete body.photo;
      }
      try {
        const banner = await LandingCustomerReview.create(body);
        if (!banner) {
          return next(new AppError("Occured an error while creating banner", 500));
        }
        res.status(201).json({
          status: "success",
          message: "LandingCustomerReview has been added successfully",
          data: {
            banner
          }
        });
      } catch (error) {
        const filePath = `uploads/banner/${req.file.filename}`;
        fs.unlink(filePath, (err) => {
          if (err && req.file)
            return next(
              new AppError("Something gone wrong while creating banner", 500)
            );
        });
        if (error.errors) {
          const messages = Object.values(error.errors).map((item) => item.properties.message).join(", ");
          return next(new AppError(`Validation failed, ${messages}.`, 400));
        } else if (error.code === 11e3) {
          const field = Object.keys(error.keyPattern).join(" ");
          const capitalizeField = field.charAt(0).toUpperCase() + field.slice(1).toLocaleLowerCase();
          const message = `${capitalizeField} already exist, Please use another ${field}.`;
          return next(new AppError(message, 409));
        }
        return next(
          new AppError(`Something went wrong while creating banner`, 400)
        );
      }
    });
    exports2.deleteLandingCustomerReviewController = catchAsync(async (req, res, next) => {
      const banner = await LandingCustomerReview.findByIdAndDelete(req.params.id);
      if (!banner) {
        return next(new AppError("No banner was found with that ID!", 404));
      }
      const photoName = banner.photo.split("/");
      const photoPath = `uploads/banner/${photoName[photoName.length - 1]}`;
      fs.unlink(photoPath, (err) => {
        if (err)
          return next(
            new AppError("Something gone wrong while deleting banner", 500)
          );
      });
      res.status(204).json({
        status: "success",
        data: null
      });
    });
    exports2.getLandingCustomerReviewController = getOne(LandingCustomerReview);
    exports2.getAllLandingCustomerReviewController = getAll(LandingCustomerReview);
  }
});

// routes/api/landingCustomerReviewRoute.js
var require_landingCustomerReviewRoute = __commonJS({
  "routes/api/landingCustomerReviewRoute.js"(exports2, module2) {
    var express = require("express");
    var {
      createLandingCustomerReviewController,
      getAllLandingCustomerReviewController,
      getLandingCustomerReviewController,
      deleteLandingCustomerReviewController
    } = require_landingCustomerReviewController();
    var {
      uploadPhotoMiddleware,
      resizePhotoMiddleware
    } = require_uploadPhotoMiddleware();
    var router = express.Router();
    router.route("/").post(
      uploadPhotoMiddleware(),
      resizePhotoMiddleware("banner"),
      createLandingCustomerReviewController
    ).get(getAllLandingCustomerReviewController);
    router.route("/:id").get(getLandingCustomerReviewController).delete(deleteLandingCustomerReviewController);
    module2.exports = router;
  }
});

// models/hotTitleModel.js
var require_hotTitleModel = __commonJS({
  "models/hotTitleModel.js"(exports2, module2) {
    var mongoose2 = require("mongoose");
    var { Schema, model } = mongoose2;
    var HotTitleSchema = new Schema(
      {
        title: {
          type: String
        }
      },
      {
        timestamps: true
      }
    );
    var HotTitle = model("HotTitle", HotTitleSchema);
    module2.exports = HotTitle;
  }
});

// models/customerReviewModel.js
var require_customerReviewModel = __commonJS({
  "models/customerReviewModel.js"(exports2, module2) {
    var mongoose2 = require("mongoose");
    var { Schema, model } = mongoose2;
    var CustomerReviewSchema = new Schema(
      {
        title: {
          type: String
        },
        description: {
          type: String
        }
      },
      {
        timestamps: true
      }
    );
    var CustomerReview = model("CustomerReview", CustomerReviewSchema);
    module2.exports = CustomerReview;
  }
});

// models/lifeStyleProductModel.js
var require_lifeStyleProductModel = __commonJS({
  "models/lifeStyleProductModel.js"(exports2, module2) {
    var mongoose2 = require("mongoose");
    var { Schema, model } = mongoose2;
    var LifeStyleProductSchema = new Schema(
      {
        title: {
          type: String
        },
        description: {
          type: String
        }
      },
      {
        timestamps: true
      }
    );
    var LifeStyleProduct = model("LifeStyleProduct", LifeStyleProductSchema);
    module2.exports = LifeStyleProduct;
  }
});

// models/lifeStyleOrderModel.js
var require_lifeStyleOrderModel = __commonJS({
  "models/lifeStyleOrderModel.js"(exports2, module2) {
    var mongoose2 = require("mongoose");
    var { Schema, model } = mongoose2;
    var LifeStyleOrderSchema = new Schema(
      {
        title: {
          type: String
        }
      },
      {
        timestamps: true
      }
    );
    var LifeStyleOrder = model("LifeStyleOrder", LifeStyleOrderSchema);
    module2.exports = LifeStyleOrder;
  }
});

// controllers/lifestyleTitleController.js
var require_lifestyleTitleController = __commonJS({
  "controllers/lifestyleTitleController.js"(exports2) {
    var fs = require("fs");
    var AppError = require_AppError();
    var catchAsync = require_catchAsync();
    var { getOne, getAll } = require_handleFactory();
    var HotTitle = require_hotTitleModel();
    var CustomerReview = require_customerReviewModel();
    var LifeStyleProduct = require_lifeStyleProductModel();
    var LifeStyleOrder = require_lifeStyleOrderModel();
    exports2.createlifeStyleHotTitleController = catchAsync(async (req, res, next) => {
      const { title } = req.body;
      console.log(title);
      await HotTitle.deleteMany();
      const newHotTitle = await HotTitle.create({ title });
      res.status(201).json({
        status: "success",
        data: newHotTitle
      });
    });
    exports2.getAlllifeStyleHotTitleController = getAll(HotTitle);
    exports2.deletelifeStyleHotTitleController = catchAsync(async (req, res, next) => {
      const hottile = await HotTitle.findByIdAndDelete(req.params.id);
      if (!hottile) {
        return next(new AppError("No hottile was found with that ID!", 404));
      }
      res.status(204).json({
        status: "success",
        data: null
      });
    });
    exports2.createlifeStyleCustomerReviewController = catchAsync(async (req, res, next) => {
      const { title, description } = req.body;
      console.log(title);
      await CustomerReview.deleteMany();
      const newCustomerReview = await CustomerReview.create({ title, description });
      res.status(201).json({
        status: "success",
        data: newCustomerReview
      });
    });
    exports2.getAlllifeStyleCustomerReviewController = getAll(CustomerReview);
    exports2.deletelifeStyleCustomerReviewController = catchAsync(async (req, res, next) => {
      const hottile = await CustomerReview.findByIdAndDelete(req.params.id);
      if (!hottile) {
        return next(new AppError("No lifestyle customer review was found with that ID!", 404));
      }
      res.status(204).json({
        status: "success",
        data: null
      });
    });
    exports2.createlifeStyleProductController = catchAsync(async (req, res, next) => {
      const { title, description } = req.body;
      console.log(title);
      await LifeStyleProduct.deleteMany();
      const newProduct = await LifeStyleProduct.create({ title, description });
      res.status(201).json({
        status: "success",
        data: newProduct
      });
    });
    exports2.getAlllifeStyleProductController = getAll(LifeStyleProduct);
    exports2.deletelifeStyleProductController = catchAsync(async (req, res, next) => {
      const hottile = await LifeStyleProduct.findByIdAndDelete(req.params.id);
      if (!hottile) {
        return next(new AppError("No lifestyle product was found with that ID!", 404));
      }
      res.status(204).json({
        status: "success",
        data: null
      });
    });
    exports2.createlifeStyleOrderController = catchAsync(async (req, res, next) => {
      const { title } = req.body;
      console.log(title);
      await LifeStyleOrder.deleteMany();
      const newOrder = await LifeStyleOrder.create({ title });
      res.status(201).json({
        status: "success",
        data: newOrder
      });
    });
    exports2.getAlllifeStyleOrderController = getAll(LifeStyleOrder);
    exports2.deletelifeStyleOrderController = catchAsync(async (req, res, next) => {
      const hottile = await LifeStyleOrder.findByIdAndDelete(req.params.id);
      if (!hottile) {
        return next(new AppError("No lifestyle order was found with that ID!", 404));
      }
      res.status(204).json({
        status: "success",
        data: null
      });
    });
  }
});

// routes/api/lifestyleTitleRoute.js
var require_lifestyleTitleRoute = __commonJS({
  "routes/api/lifestyleTitleRoute.js"(exports2, module2) {
    var express = require("express");
    var {
      createlifeStyleHotTitleController,
      getAlllifeStyleHotTitleController,
      deletelifeStyleHotTitleController,
      createlifeStyleCustomerReviewController,
      getAlllifeStyleCustomerReviewController,
      deletelifeStyleCustomerReviewController,
      createlifeStyleProductController,
      getAlllifeStyleProductController,
      deletelifeStyleProductController,
      createlifeStyleOrderController,
      getAlllifeStyleOrderController,
      deletelifeStyleOrderController
    } = require_lifestyleTitleController();
    var router = express.Router();
    router.route("/hot-title").post(createlifeStyleHotTitleController).get(getAlllifeStyleHotTitleController);
    router.route("/hot-title/:id").delete(deletelifeStyleHotTitleController);
    router.route("/customer-review").post(createlifeStyleCustomerReviewController).get(getAlllifeStyleCustomerReviewController);
    router.route("/customer-review/:id").delete(deletelifeStyleCustomerReviewController);
    router.route("/product").post(createlifeStyleProductController).get(getAlllifeStyleProductController);
    router.route("/product/:id").delete(deletelifeStyleProductController);
    router.route("/order").post(createlifeStyleOrderController).get(getAlllifeStyleOrderController);
    router.route("/order/:id").delete(deletelifeStyleOrderController);
    module2.exports = router;
  }
});

// controllers/childCategoryController.js
var require_childCategoryController = __commonJS({
  "controllers/childCategoryController.js"(exports2) {
    var ChildCategory = require_childCategoryModel();
    var SubCategory = require_subCategoryModel();
    var Category = require_categoryModel();
    var AppError = require_AppError();
    var catchAsync = require_catchAsync();
    var { createOne, getAll, getOne, updateOne } = require_handleFactory();
    exports2.createChildCategoryController = createOne(ChildCategory);
    exports2.getAllChildCategoryController = getAll(ChildCategory, [
      { path: "subCategory", select: "title slug category" }
    ]);
    exports2.getChildCategoryController = getOne(ChildCategory, [
      { path: "subCategory", select: "title slug category" }
    ]);
    exports2.updateChildCategoryController = updateOne(ChildCategory);
    exports2.deleteChildCategoryController = catchAsync(async (req, res, next) => {
      const childCategory = await ChildCategory.findById(req.params.id);
      if (!childCategory) {
        return next(new AppError("No Child-Category was found with that ID!", 404));
      }
      const subCategoryId = childCategory.subCategory;
      await ChildCategory.findByIdAndDelete(req.params.id);
      if (subCategoryId) {
        await SubCategory.findByIdAndUpdate(subCategoryId, {
          $pull: { childCategories: req.params.id }
        });
      }
      res.status(204).json({
        status: "success",
        message: "Child-Category deleted successfully",
        data: null
      });
    });
    exports2.createChildCategoryCascadingController = catchAsync(
      async (req, res, next) => {
        const {
          categoryTitle,
          subCategoryTitle,
          childCategoryTitle
        } = req.body || {};
        if (!categoryTitle || !subCategoryTitle) {
          return next(
            new AppError(
              "categoryTitle and subCategoryTitle are required.",
              400
            )
          );
        }
        let category = await Category.findOne({ title: categoryTitle });
        if (!category) {
          category = await Category.create({ title: categoryTitle });
        }
        let subCategory = await SubCategory.findOne({
          category: category._id,
          title: subCategoryTitle
        });
        if (!subCategory) {
          subCategory = await SubCategory.create({
            title: subCategoryTitle,
            category: category._id
          });
          await Category.findByIdAndUpdate(category._id, {
            $addToSet: { subCategories: subCategory._id }
          });
        }
        let childCategory = null;
        if (childCategoryTitle) {
          childCategory = await ChildCategory.create({
            title: childCategoryTitle,
            subCategory: subCategory._id
          });
          await SubCategory.findByIdAndUpdate(subCategory._id, {
            $addToSet: { childCategories: childCategory._id }
          });
        }
        res.status(201).json({
          status: "success",
          message: "Category/SubCategory cascading logic completed successfully",
          data: {
            category,
            subCategory,
            childCategory
          }
        });
      }
    );
  }
});

// routes/api/childCategoryRoute.js
var require_childCategoryRoute = __commonJS({
  "routes/api/childCategoryRoute.js"(exports2, module2) {
    var express = require("express");
    var {
      createChildCategoryController,
      getAllChildCategoryController,
      getChildCategoryController,
      updateChildCategoryController,
      deleteChildCategoryController,
      createChildCategoryCascadingController
    } = require_childCategoryController();
    var router = express.Router();
    router.route("/cascading").post(createChildCategoryCascadingController);
    router.route("/").post(createChildCategoryController).get(getAllChildCategoryController);
    router.route("/:id").get(getChildCategoryController).patch(updateChildCategoryController).delete(deleteChildCategoryController);
    module2.exports = router;
  }
});

// routes/api/index.js
var require_api = __commonJS({
  "routes/api/index.js"(exports2, module2) {
    var express = require("express");
    var authRoute = require_authRotue();
    var categoryRoute = require_categoryRoute();
    var subCategoryRoute = require_subCategoryRoute();
    var brandRoute = require_brandRoute();
    var productRoute = require_productRoute();
    var varientRoute = require_varientRoute();
    var optionRoute = require_optionRoute();
    var searchRoute = require_searchRoute();
    var bannerRoute = require_bannerRoute();
    var discountRoute = require_discountRoute();
    var orderRoute = require_orderRoute();
    var couponRoute = require_couponRoute();
    var pathaoLocationRoute = require_pathaoLocationRoute();
    var featuredProductRoute = require_featuredProductRoute();
    var landingBannerRoute = require_landingBannerRoute();
    var landingCustomerReviewRoute = require_landingCustomerReviewRoute();
    var lifestyleTitleRoute = require_lifestyleTitleRoute();
    var childCategoryRoute = require_childCategoryRoute();
    var router = express.Router();
    router.use("/auth", authRoute);
    router.use("/category", categoryRoute);
    router.use("/subCategory", subCategoryRoute);
    router.use("/childCategory", childCategoryRoute);
    router.use("/brand", brandRoute);
    router.use("/product", productRoute);
    router.use("/varient", varientRoute);
    router.use("/option", optionRoute);
    router.use("/search", searchRoute);
    router.use("/banner", bannerRoute);
    router.use("/discount", discountRoute);
    router.use("/order", orderRoute);
    router.use("/pathaoLocation", pathaoLocationRoute);
    router.use("/coupon", couponRoute);
    router.use("/featuredProduct", featuredProductRoute);
    router.use("/landingBanner", landingBannerRoute);
    router.use("/landingCustomerReview", landingCustomerReviewRoute);
    router.use("/life-style", lifestyleTitleRoute);
    module2.exports = router;
  }
});

// middlewares/errorRouteMiddleware.js
var require_errorRouteMiddleware = __commonJS({
  "middlewares/errorRouteMiddleware.js"(exports2, module2) {
    var AppError = require_AppError();
    var errorRouteMiddleware = (req, res, next) => {
      const error = `Can't find ${req.originalUrl} on this server!`;
      next(new AppError(error, 404));
    };
    module2.exports = errorRouteMiddleware;
  }
});

// routes/index.js
var require_routes = __commonJS({
  "routes/index.js"(exports2, module2) {
    var express = require("express");
    var baseURL = process.env.BASE_URL;
    var apiRoutes = require_api();
    var errorRouteMiddleware = require_errorRouteMiddleware();
    var router = express.Router();
    router.use(baseURL, apiRoutes);
    router.all("*", errorRouteMiddleware);
    module2.exports = router;
  }
});

// app.js
var require_app = __commonJS({
  "app.js"(exports2, module2) {
    var path = require("path");
    var express = require("express");
    var helmet = require("helmet");
    var monogoSanitize = require("express-mongo-sanitize");
    var bodyParser = require("body-parser");
    var cookieParser = require("cookie-parser");
    var cors = require("cors");
    var globalErrorMiddleware = require_globalErrorMiddleware();
    var routes = require_routes();
    var app2 = express();
    app2.use(cors({
      origin: ["http://localhost:5174", "http://localhost:5173"],
      credentials: true
    }));
    app2.use(bodyParser.json());
    app2.use(bodyParser.urlencoded({ extended: true }));
    app2.use("/uploads", express.static(path.join(__dirname, "uploads")));
    app2.use(helmet());
    app2.use(express.json({ limit: "10kb" }));
    app2.use(cookieParser());
    app2.use(monogoSanitize());
    app2.get("/", (req, res) => {
      return res.send("hello from okobiz");
    });
    app2.use(routes);
    app2.use(globalErrorMiddleware);
    module2.exports = app2;
  }
});

// index.js
var dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
require("dotenv").config();
var mongoose = require("mongoose");
var app = require_app();
var User = require_userModel();
mongoose.connect(process.env.DATABASE).then(() => {
  console.log("Database Connected \u2713");
}).catch((err) => console.log("DB Connection Error", "-->", err.message));
async function seedAdmin() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminExists = await User.findOne({ email: adminEmail, role: "aklogicAdmin" });
    if (adminExists) {
      console.log("Admin already exists");
      return;
    }
    const newAdmin = new User({
      name: "Admin",
      email: adminEmail,
      role: "aklogicAdmin",
      password: adminPassword,
      confirmPassword: adminPassword,
      phone: "0000000000"
    });
    await newAdmin.save();
    console.log("Admin seeded successfully");
  } catch (error) {
    console.error(error);
  }
}
var PORT = process.env.PORT || 5e3;
var server = app.listen(PORT, async () => {
  console.log(`SERVER IS RUNNING ON PORT ${PORT}`);
  await seedAdmin();
});
