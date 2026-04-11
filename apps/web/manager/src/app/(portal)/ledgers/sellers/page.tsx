import { redirect } from "next/navigation";

export default function SellerLedgersRoute(): never {
  redirect("/ledgers/sellers/day");
}
