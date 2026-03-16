import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getStripe } from "@/lib/stripe";
import { SITE_URL } from "@/lib/site-config";
import { auth } from "@/lib/auth";

const checkoutSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      title: z.string(),
      price: z.number().positive(),
      quantity: z.number().int().positive(),
      image: z.string().optional(),
    })
  ).min(1),
  locale: z.string().optional(),
  email: z.string().email().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, email, locale: bodyLocale } = checkoutSchema.parse(body);
    const stripe = getStripe();

    const session_auth = await auth();
    const userId = session_auth?.user?.id;
    const locale = bodyLocale || "en";

    const lineItems = items.map((item) => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: item.title,
          ...(item.image ? { images: [item.image] } : {}),
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      ...(email ? { customer_email: email } : {}),
      shipping_address_collection: { allowed_countries: ["RO", "US", "GB", "DE", "FR", "IT", "ES", "NL", "BE", "AT"] },
      success_url: `${SITE_URL}/${locale}/thank-you?ref={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/${locale}/checkout`,
      metadata: {
        type: "product",
        userId: userId || "",
        product_ids: items.map((i) => i.productId).join(","),
        cartItems: JSON.stringify(items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          price: i.price,
        }))),
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
