import Stripe from "stripe";

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not defined in .env");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
};

export default getStripe;