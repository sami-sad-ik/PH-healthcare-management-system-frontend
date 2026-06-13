export default function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <p>Admin Dashboard Layout</p>
      {children}
    </>
  );
}
