import { getTranslations } from "next-intl/server";
import { CheckoutClient } from "./checkout-client";

export default async function CheckoutPage() {
  const t = await getTranslations("checkout");

  return (
    <CheckoutClient
      labels={{
        heroTitle: t("heroTitle"),
        yourCart: t("yourCart"),
        qty: t("qty"),
        subtotal: t("subtotal"),
        shipping: t("shipping"),
        shippingFree: t("shippingFree"),
        total: t("total"),
        shippingDetails: t("shippingDetails"),
        firstNameLabel: t("firstNameLabel"),
        firstNamePlaceholder: t("firstNamePlaceholder"),
        lastNameLabel: t("lastNameLabel"),
        lastNamePlaceholder: t("lastNamePlaceholder"),
        emailLabel: t("emailLabel"),
        emailPlaceholder: t("emailPlaceholder"),
        addressLabel: t("addressLabel"),
        addressPlaceholder: t("addressPlaceholder"),
        cityLabel: t("cityLabel"),
        cityPlaceholder: t("cityPlaceholder"),
        postalCodeLabel: t("postalCodeLabel"),
        postalCodePlaceholder: t("postalCodePlaceholder"),
        securedNote: t("securedNote"),
        processing: t("processing"),
        emptyCart: t("emptyCart"),
        continueShopping: t("continueShopping"),
      }}
    />
  );
}
