import { QwikLoader } from "../components/QwikLoader";
import { Partytown, GoogleTagManager } from "@builder.io/partytown/react";

export const Head = () => (
  <>
    <meta name="viewport" content="width=device-width" />

    <link
      rel="apple-touch-icon"
      sizes="180x180"
      href="/favicons/apple-touch-icon.png"
    />
    <link
      rel="icon"
      type="image/png"
      sizes="32x32"
      href="/favicons/favicon-32x32.png"
    />
    <link
      rel="icon"
      type="image/png"
      sizes="16x16"
      href="/favicons/favicon-16x16.png"
    />
    <link rel="shortcut icon" href="/favicons/favicon.ico" />

    <meta name="apple-mobile-web-app-title" content="Qwik" />
    <meta name="application-name" content="Qwik" />
    <meta name="theme-color" content="#ffffff" />

    <meta name="twitter:site" content="@QwikDev" />
    <meta name="twitter:creator" content="@QwikDev" />
    <meta
      name="twitter:description"
      content="Web Framework focusing on Time-to-Interactive."
    />
    <meta name="twitter:card" content="summary" />

    <QwikLoader />
    <GoogleTagManager containerId="GTM-N3WSTXZ" />
    <Partytown
      resolveUrl={(url) => {
        if (
          url.hostname.includes("www.google-analytics.com") ||
          url.hostname.includes("snap.licdn.com")
        ) {
          const proxyUrl = new URL("https://cdn.builder.io/api/v1/proxy-api");
          proxyUrl.searchParams.append("url", url.href);
          return proxyUrl;
        }
        return null;
      }}
    />
  </>
);
