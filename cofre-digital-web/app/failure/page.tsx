import { redirect } from "next/navigation";

export default function FailureRedirectPage() {
  redirect("/checkout/failure");
}
