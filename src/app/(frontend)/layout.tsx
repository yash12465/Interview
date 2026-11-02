import type { Metadata } from 'next'
import Script from 'next/script'
import type React from 'react'
import { appearanceInitScript, DEFAULT_APPEARANCE } from '@/lib/appearance-config'
import { BodyCustomCode, renderHeadCustomCode } from '@/lib/make-custom-code'
import { makeSiteSettings, sanitizeHtmlAttribute } from '@/lib/make-site-settings'
import { AuthProvider } from '@/lib/supabase/use-auth'
import './styles.css'

const defaultTitle = 'InterviewSetu'
const title = makeSiteSettings.title ?? defaultTitle
const description =
  makeSiteSettings.description ??
  'Learn how to answer. Practise with confidence. Improve with every interview.'
const favicon = makeSiteSettings.icons?.icon
const socialImage = makeSiteSettings.openGraph?.image
const googleAnalyticsId = sanitizeHtmlAttribute(makeSiteSettings.analytics?.googleAnalyticsId)

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:40050'),
  title,
  description,
  robots: makeSiteSettings.robots?.index === false ? { follow: false, index: false } : undefined,
  icons: favicon ? { icon: favicon } : undefined,
  openGraph: {
    title,
    description,
    images: socialImage ? [socialImage] : undefined,
  },
  twitter: socialImage
    ? {
        card: 'summary_large_image',
        images: [socialImage],
      }
    : undefined,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const language = sanitizeHtmlAttribute(makeSiteSettings.language) || 'en'
  const addBypassLinks = makeSiteSettings.accessibility?.addBypassLinks === true
  const customScripts = makeSiteSettings.customScripts

  return (
    <html
      lang={language}
      data-theme={DEFAULT_APPEARANCE.theme}
      data-accent={DEFAULT_APPEARANCE.accent}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        {/*
          Applies the saved theme before first paint; see src/lib/appearance-config.ts.
          A plain inline script on purpose: next/script beforeInteractive queues inline code until the JS bundles load.
        */}
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static string built from our own constants, no user input. */}
        <script dangerouslySetInnerHTML={{ __html: appearanceInitScript }} />
        {renderHeadCustomCode(customScripts?.headStart, 'head-start')}
        {renderHeadCustomCode(customScripts?.headEnd, 'head-end')}
      </head>
      <body className="min-h-screen bg-surface text-ink antialiased">
        <BodyCustomCode html={customScripts?.bodyStart} />
        {addBypassLinks && (
          <a className="figma-bypass-link" href="#root">
            Skip to content
          </a>
        )}
        <div id="root" tabIndex={-1}>
          <AuthProvider>{children}</AuthProvider>
        </div>
        {googleAnalyticsId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
              strategy="afterInteractive"
            />
            <Script id="figma-google-analytics" strategy="afterInteractive">
              {`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', ${JSON.stringify(googleAnalyticsId)});
`}
            </Script>
          </>
        )}
        <BodyCustomCode html={customScripts?.bodyEnd} />
      </body>
    </html>
  )
}
