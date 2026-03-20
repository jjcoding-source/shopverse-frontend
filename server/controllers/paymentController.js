import getStripe from "../config/stripe.js";
import Order     from "../models/Order.js";

export const createCheckoutSession = async (req, res) => {
  const stripe = getStripe();
  const { items, shippingAddress } = req.body;

  const lineItems = items.map((item) => ({
    price_data: {
      currency:     "usd",
      product_data: {
        name:   item.name,
        images: item.image ? [item.image] : [],
      },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: item.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items:           lineItems,
    mode:                 "payment",
    success_url: `${process.env.CLIENT_URL}/order-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${process.env.CLIENT_URL}/checkout`,
    customer_email: req.user.email,
    metadata: {
      userId:          req.user._id.toString(),
      shippingAddress: JSON.stringify(shippingAddress),
    },
  });

  res.json({ success: true, sessionId: session.id, url: session.url });
};

export const stripeWebhook = async (req, res) => {
  const stripe = getStripe();
  const sig    = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).json({ message: `Webhook error: ${err.message}` });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    await Order.findOneAndUpdate(
      { stripeSessionId: session.id },
      {
        isPaid:        true,
        paidAt:        Date.now(),
        status:        "processing",
        paymentResult: {
          id:     session.payment_intent,
          status: session.payment_status,
          email:  session.customer_email,
        },
      }
    );
  }

  res.json({ received: true });
};

export const getStripeConfig = async (req, res) => {
  res.json({
    success:        true,
    publishableKey: process.env.STRIPE_PUBLIC_KEY,
  });
};