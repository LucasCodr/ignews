import {NextApiRequest, NextApiResponse} from "next";
import {Readable} from 'stream';
import {Stripe} from "stripe";
import {stripe} from "../../services/stripe";
import {saveSubscription} from "./_lib/manageSubscription";

async function buffer(readable: Readable) {
  const chunks = [];

  for await (const chunk of readable) {
    chunks.push(
      typeof chunk === 'string' ? Buffer.from(chunk) : chunk
    );
  }

  return Buffer.concat(chunks);
}

export const config = {
  api: {
    bodyParser: false,
  }
}

const eventKeys = new Set([
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
])

export default async function (req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end('Method not allowed.')
  }

  const reqBuffer = await buffer(req)
  const secret = req.headers['stripe-signature']

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(reqBuffer, secret, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (e) {
    return res.status(400).send(`Webhook Error: ${e.message}`)
  }

  const {type} = event;

  if (!eventKeys.has(type)) {
    return res.json({ok: true});
  }

  try {
    switch (type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscription = event.data.object as Stripe.Subscription

        await saveSubscription(
          subscription.id,
          subscription.customer.toString(),
          type === 'customer.subscription.created'
        )

        break
      case 'checkout.session.completed':
        const checkoutSession = event.data.object as Stripe.Checkout.Session

        await saveSubscription(
          checkoutSession.subscription.toString(),
          checkoutSession.customer.toString(),
          true
        )

        break
      default:
        throw new Error("Event handler not found.")
    }
  } catch (e) {
    return res.status(400).send(e.message)
  }
}