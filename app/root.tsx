import { Links, LiveReload, Meta, Outlet } from "remix";
import type { MetaFunction } from "remix";
import styles from "./styles/app.css";
import { QwikLoader } from "./components/QwikLoader";
import { Head } from "./components/Head";
import { Header } from "./components/Header";

export const meta: MetaFunction = () => {
  return { title: "Qwik" };
};

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export default function App() {
  return (
    <html lang="en" className="h-screen">
      <head>
        <meta charSet="utf-8" />
        <Head />
        <Meta />
        <Links />
        <QwikLoader />
      </head>
      <body className="bg-gray-900 text-slate-100 antialiased h-screen">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <Outlet />
        </main>
        {process.env.NODE_ENV === "development" && <LiveReload />}
      </body>
    </html>
  );
}
