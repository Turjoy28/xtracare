const axios = require("axios");
const crypto = require("crypto");

const hashData = (data) => {
  if (!data) return "";
  return crypto.createHash("sha256").update(data.trim().toLowerCase()).digest("hex");
};

const sendMetaPurchaseEvent = async (order, req) => {
  try {
    const pixelId = process.env.META_PIXEL_ID;
    const accessToken = process.env.META_ACCESS_TOKEN;

    if (!pixelId || !accessToken) {
      console.warn("Meta Pixel ID or Access Token is missing. Skipping Conversions API.");
      return;
    }

    const contents = order.products.map(p => {
      const productId = p.product && p.product._id ? p.product._id.toString() : p.product?.toString();
      return {
        id: productId || "unknown",
        quantity: p.quantity,
      };
    });

    const eventData = {
      data: [
        {
          event_name: "Purchase",
          event_time: Math.floor(Date.now() / 1000),
          action_source: "website",
          user_data: {
            em: [hashData(order.email)],
            ph: [hashData(order.phone)],
            client_ip_address: req.ip || req.connection?.remoteAddress || "127.0.0.1",
            client_user_agent: req.headers["user-agent"] || "",
          },
          custom_data: {
            currency: "BDT",
            value: order.totalCost,
            order_id: order._id.toString(),
            contents: contents,
          },
        },
      ],
    };

    const response = await axios.post(
      `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`,
      eventData
    );

    console.log("Meta Conversions API (Purchase) sent successfully:", response.data);
  } catch (error) {
    console.error("Error sending Meta Conversions API event:", error.response?.data || error.message);
  }
};

module.exports = {
  sendMetaPurchaseEvent,
};
