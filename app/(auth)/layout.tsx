export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-surface to-background px-4 py-12 sm:px-6">
      {children}
    </div>
  );
}
