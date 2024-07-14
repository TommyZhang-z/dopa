import Stripe from "stripe";
import { NextResponse } from "next/server";
import { currentUser, auth } from "@clerk/nextjs/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20",
});

export async function POST() {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const user = await currentUser()!;

    const params: Stripe.Checkout.SessionCreateParams = {
      line_items: [{ price: process.env.PRICE_ID!, quantity: 1 }],
      customer_email: user?.emailAddresses[0].emailAddress,
      metadata: {
        userId: userId,
      },
      mode: "subscription",
      success_url: `https://dopa-one.vercel.app/`,
      cancel_url: `https://dopa-one.vercel.app/`,
    };

    const checkoutSession: Stripe.Checkout.Session =
      await stripe.checkout.sessions.create(params);

    return NextResponse.json({ result: checkoutSession, ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "something went wrong", ok: false },
      { status: 500 }
    );
  }
}
