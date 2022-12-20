import { component$ } from "@builder.io/qwik";
import { DocumentHead, loader$ } from "@builder.io/qwik-city";
import { Link } from "@builder.io/qwik-city";

export const pageLoader = loader$(() => {
  return {
    now: new Date(Date.now()).toISOString(),
    nodeVersion: process.version,
  };
});

export default component$(() => {
  const pageInfo = pageLoader.use();

  return (
    <div>
      <h1>
        Qwik <span class="lightning">⚡️</span>
      </h1>

      <p>Now: {pageInfo.value.now}</p>
      <p>Node: {pageInfo.value.nodeVersion}</p>

      <Link class="mindblow" href="/flower/">
        Blow my mind 🤯
      </Link>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Welcome to Qwik",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
};
