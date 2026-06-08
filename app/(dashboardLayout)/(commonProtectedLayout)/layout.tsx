export default function CommonProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <p>Common Protected Layout</p>
      {children}
    </>
  );
}
