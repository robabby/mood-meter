export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-canvas flex items-center justify-center p-6">
      {children}
    </main>
  );
}
