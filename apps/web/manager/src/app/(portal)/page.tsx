/**
 * Portal Root Page
 * Redirects to dashboard
 */

import { redirect } from 'next/navigation';

export default function PortalPage(): never {
  redirect("/dashboard");
}
