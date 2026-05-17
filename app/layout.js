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
    other: {
      ...sentryTraceData,
    },
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans bg-canvas text-ink min-h-screen flex">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
