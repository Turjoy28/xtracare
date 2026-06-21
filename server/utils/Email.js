const nodemailer = require("nodemailer");
const { convert } = require("html-to-text");

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.url = url;
    this.from = `Extracare BD <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(html, subject) {
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html),
    };

    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    const html = `
      <h1>Welcome to the Extracare BD Family, ${this.firstName}!</h1>
      <p>We are excited to have you onboard.</p>
      <p>Click <a href="${this.url}">here</a> to get started.</p>
    `;

    await this.send(html, "Welcome to the Extracare BD Family!");
  }

  async sendPasswordReset() {
    const html = `
    <h1>Password Reset Request</h1>
    <p>Hi ${this.firstName},</p>
    <p>You requested a password reset. Click the link below to set a new password. This link is valid for only 10 minutes.</p>
    <p><a href="${this.url}">Reset your password</a></p>
    <p>If you did not request a password reset, please ignore this email.</p>
    <p>Thanks,</p>
    <p>Extracare BD Team</p>
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
          ${order.products
        .map((product) => {
          const option = product.option;
          if (!option) {
            const productName = (product.product && product.product.name) || "Deleted Product Variant";
            return `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${productName}</td>
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

          const discountPercentage = originalPrice > 0
            ? ((discountAmount / originalPrice) * 100).toFixed(2)
            : "0.00";

          const subtotal = discountPrice * product.quantity;

          const productName = (option.product && option.product.name)
            || (product.product && product.product.name)
            || "Unknown Product";

          const colorName = (option.variant && option.variant.colorName) || "N/A";
          const colorCode = (option.variant && option.variant.colorCode) || "";
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
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">৳ ${originalPrice.toFixed(2)}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">৳ ${discountAmount.toFixed(2)} (${discountPercentage}%)</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">৳ ${subtotal.toFixed(2)}</td>
              </tr>
            `;
        })
        .join("")}
        </tbody>
      </table>
      <p>
        <strong>
          Shipping Cost: ${order.shippingCost > 0 ? ` ৳ ${order.shippingCost}` : "FREE"
      }
        </strong>
      </p>
      <p><strong>Sub-Total: ৳ ${order.totalCost}</strong></p>
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
          ${order.products
        .map((product) => {
          const option = product.option;
          if (!option) {
            const productName = (product.product && product.product.name) || "Deleted Product Variant";
            return `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${productName}</td>
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

          const productName = (option.product && option.product.name)
            || (product.product && product.product.name)
            || "Unknown Product";

          const colorName = (option.variant && option.variant.colorName) || "N/A";
          const colorCode = (option.variant && option.variant.colorCode) || "";
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
                  ৳ ${originalPrice.toFixed(2)}
                </td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">
                  N/A
                </td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">
                  ৳ ${subtotal.toFixed(2)}
                </td>
              </tr>
            `;
        })
        .join("")}
        </tbody>
      </table>
      <p>
        <strong>
          Shipping Cost: ${order.shippingCost > 0 ? ` ৳ ${order.shippingCost}` : "FREE"
      }
        </strong>
      </p>
      <p>
        <strong>
          Product Total: ৳ ${order.products
        .reduce(
          (total, product) => {
            const price = (product.option && product.option.price) || 0;
            return total + price * product.quantity;
          },
          0
        )
        .toFixed(2)}
        </strong>
      </p>
      <p>
        <strong>
          Coupon Discount: (${discountPercent}%): ৳ ${order.couponDiscount.toFixed(
          2
        )}
        </strong>
      </p>
      <p>
        <strong>
          Sub-Total: ৳ ${order.totalCost.toFixed(2)}
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
