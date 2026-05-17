import './globals.css';
import Providers from '../components/Providers';

export async function generateMetadata() {
  const sentryTraceData =
    process.env.NEXT_PUBLIC_SENTRY_ENABLED === 'true'
      ? (await import('@sentry/nextjs')).getTraceData()
      : {};

  return {
    title: 'SOS-Market — Intermarché Gif-sur-Yvette',
    description: 'Surveillance des crises et gestion des stocks quotidienne',
    icons: {
      icon: [
        { url: '/logo/favicon.ico' },
        { url: '/logo/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
        { url: '/logo/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      ],
    },
    other: {
      ...sentryTraceData,
    },
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className="font-sans bg-canvas text-ink min-h-screen flex">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
