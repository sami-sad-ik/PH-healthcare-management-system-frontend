export default function PatientDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <p>Patient Dashboard Layout</p>
      {children}
    </>
  );
}
