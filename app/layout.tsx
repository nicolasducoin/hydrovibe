import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hydrovibe - Search Hydroweb with AI',
  description: 'Search Hydroweb products using natural language with AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
