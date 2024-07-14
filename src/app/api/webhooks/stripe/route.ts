import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

type Metadata = {
  userId: string;
};

export async function POST(req: Request) {
  try {
    const body = await req.text();

    const signature = headers().get("stripe-signature") as string;

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    const completedEvent = event.data.object as Stripe.Checkout.Session & {
      metadata: Metadata;
    };

    if (event.type === "checkout.session.completed") {
      const subscription = await stripe.subscriptions.retrieve(
        completedEvent.subscription as string
      );

      console.log("Subscription", subscription);
    }

    return NextResponse.json({ result: event, ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        message: "something went wrong",
        ok: false,
      },
      { status: 500 }
    );
  }
}
