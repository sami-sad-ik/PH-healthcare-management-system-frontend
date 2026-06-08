export default function DoctorDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <p>Doctor Dashboard Layout</p>
      {children}
    </>
  );
}
