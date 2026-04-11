// Static export compatible - no dynamic rendering needed

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  return children;
}
