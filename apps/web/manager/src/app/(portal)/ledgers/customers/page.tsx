import { redirect } from "next/navigation";

export default function CustomerLedgersRoute(): never {
  redirect("/ledgers/customers/day");
}
