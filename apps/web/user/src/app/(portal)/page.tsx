import { redirect } from "next/navigation";

export default function PortalIndexPage(): never {
  redirect("/bills");
}
