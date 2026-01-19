import { redirect } from "next/navigation";

export default function SuccessRedirectPage() {
  redirect("/checkout/success");
}
