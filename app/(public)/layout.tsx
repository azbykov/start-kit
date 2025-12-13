/**
 * Layout for public pages (no AppLayout, just pass through)
 * Public pages like home and example don't need the app layout
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

