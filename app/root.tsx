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
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <Head />
        <Meta />
        <Links />
        <QwikLoader />
      </head>
      <body className="bg-gray-900 text-slate-100 overflow-hidden antialiased">
        <Header />
        <main className="p-4">
          <Outlet />
        </main>

        {process.env.NODE_ENV === "development" && <LiveReload />}
        <script />
      </body>
    </html>
  );
}
