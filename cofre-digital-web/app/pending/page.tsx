import { redirect } from "next/navigation";

export default function PendingRedirectPage() {
  redirect("/checkout/pending");
}
