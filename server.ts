import express from 'express';
import { createServer as createViteServer } from 'vite';
import Stripe from 'stripe';
import path from 'path';

const app = express();
const PORT = 3000;

// Initialize Stripe lazily
let stripeClient: Stripe | null = null;
function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required');
    }
    stripeClient = new Stripe(key, { apiVersion: '2023-10-16' });
  }
  return stripeClient;
}

app.use(express.json());

// API routes FIRST
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const stripe = getStripe();
    
    // The APP_URL is provided by the environment, fallback to localhost
    const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: 'Resume Analyzer Pro',
              description: 'Unlimited AI analyses, Cover Letter Generation, ATS Optimization, and more.',
            },
            unit_amount: 20000, // 200 INR in paise
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${appUrl}/?session_id={CHECKOUT_SESSION_ID}&upgrade_success=true&user_id=${userId}`,
      cancel_url: `${appUrl}/?canceled=true`,
      client_reference_id: userId,
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
