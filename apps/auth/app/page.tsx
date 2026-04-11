import { AuthAccessDenied } from "@/components/auth-shell";

export default function HomePage() {
  return (
    <AuthAccessDenied
      title="Access denied"
      message="The auth hub must be opened by one of the MFC apps."
    />
  );
}
