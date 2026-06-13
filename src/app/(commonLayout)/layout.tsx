export default function CommonLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <p>commonlayout</p>
      {children}
    </>
  );
}
