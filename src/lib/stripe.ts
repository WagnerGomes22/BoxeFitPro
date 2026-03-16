// lib/stripe.ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key', {
  typescript: true,
  appInfo: {
    name: 'BoxeFit Pro',
    version: '0.1.0',
  },
});
