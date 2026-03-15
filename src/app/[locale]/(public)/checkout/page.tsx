import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const cartItems = [
  {
    title: "Nocturnal Echoes (Signed Edition)",
    variant: "Hardcover",
    price: 35.0,
    quantity: 1,
    image: "/design-exports/YYqNy.png",
  },
  {
    title: "Fog Study No. 3 \u2014 Fine Art Print",
    variant: "A3, Giclée",
    price: 45.0,
    quantity: 1,
    image: "/design-exports/cNCJX.png",
  },
];

export default async function CheckoutPage() {
  const t = await getTranslations("checkout");

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const shipping: number = 0;
  const total = subtotal + shipping;

  return (
    <section className="px-5 md:px-10 xl:px-20 py-12">
      <h1 className="font-serif text-3xl md:text-[42px] font-light text-warm-ivory leading-tight">
        {t("heroTitle")}
      </h1>

      <div className="flex flex-col md:flex-row gap-12 mt-10">
        {/* ── Cart Items ── */}
        <div className="flex-1">
          <span className="font-mono text-[10px] font-medium uppercase tracking-[3px] text-accent-dim">
            {t("yourCart")}
          </span>

          <div className="mt-4 space-y-0">
            {cartItems.map((item) => (
              <div
                key={item.title}
                className="flex items-center gap-4 py-6 border-t border-border"
              >
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded shrink-0 relative overflow-hidden">
                  <Image src={item.image} alt={item.title} fill className="object-cover" />
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h3 className="font-sans text-sm text-text-primary">
                    {item.title}
                  </h3>
                  <p className="font-mono text-[10px] text-text-muted mt-1">
                    {item.variant} &middot; {t("qty")}: {item.quantity}
                  </p>
                </div>

                {/* Price */}
                <span className="font-serif text-lg font-bold text-gold">
                  &euro;{item.price.toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-border pt-4 mt-2 space-y-2">
            <div className="flex justify-between">
              <span className="font-sans text-sm text-text-secondary">
                {t("subtotal")}
              </span>
              <span className="font-sans text-sm text-text-primary">
                &euro;{subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-sans text-sm text-text-secondary">
                {t("shipping")}
              </span>
              <span className="font-sans text-sm text-text-primary">
                {shipping === 0 ? t("shippingFree") : `\u20AC${shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-border">
              <span className="font-sans text-sm font-medium text-text-primary">
                {t("total")}
              </span>
              <span className="font-serif text-xl font-bold text-gold">
                &euro;{total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* ── Checkout Form ── */}
        <div className="w-full md:w-[400px] bg-bg-surface p-8 rounded">
          <span className="font-mono text-[10px] font-medium uppercase tracking-[3px] text-accent-dim">
            {t("shippingDetails")}
          </span>

          <form className="flex flex-col gap-5 mt-6">
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="firstName"
                label={t("firstNameLabel")}
                type="text"
                placeholder={t("firstNamePlaceholder")}
              />
              <Input
                id="lastName"
                label={t("lastNameLabel")}
                type="text"
                placeholder={t("lastNamePlaceholder")}
              />
            </div>

            <Input
              id="email"
              label={t("emailLabel")}
              type="email"
              placeholder={t("emailPlaceholder")}
            />

            <Input
              id="address"
              label={t("addressLabel")}
              type="text"
              placeholder={t("addressPlaceholder")}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                id="city"
                label={t("cityLabel")}
                type="text"
                placeholder={t("cityPlaceholder")}
              />
              <Input
                id="postalCode"
                label={t("postalCodeLabel")}
                type="text"
                placeholder={t("postalCodePlaceholder")}
              />
            </div>

            {/* Payment Placeholder */}
            <div className="mt-4">
              <span className="font-mono text-[10px] font-medium uppercase tracking-[2px] text-text-muted mb-2 block">
                {t("paymentLabel")}
              </span>
              <div className="h-12 bg-bg-card border border-border rounded flex items-center justify-center">
                <span className="font-mono text-[10px] text-text-muted">
                  {t("paymentPlaceholder")}
                </span>
              </div>
            </div>

            <Button variant="filled" size="lg" className="w-full mt-4">
              {t("placeOrder")}
            </Button>
          </form>

          <p className="font-mono text-[10px] text-text-muted text-center mt-4">
            {t("securedNote")}
          </p>
        </div>
      </div>
    </section>
  );
}
