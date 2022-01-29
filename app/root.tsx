import { Links, LiveReload, Meta, Outlet } from "remix";
import type { MetaFunction } from "remix";
import { getQwikLoaderScript } from "./qwikloader";
import styles from "./styles/app.css";

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
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
        <script
          dangerouslySetInnerHTML={{
            __html: getQwikLoaderScript(),
          }}
        />
      </head>
      <body>
        <Outlet />
        {process.env.NODE_ENV === "development" && <LiveReload />}
        <script />
      </body>
    </html>
  );
}
