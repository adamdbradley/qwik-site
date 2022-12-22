import { component$ } from "@builder.io/qwik";
import { DocumentHead, loader$ } from "@builder.io/qwik-city";
import { Link } from "@builder.io/qwik-city";

export const pageLoader = loader$(() => {
  console.log("run pageLoader", new Date(Date.now()).toISOString());
  return {
    now: new Date(Date.now()).toISOString(),
  };
});

export default component$(() => {
  console.log("run component$", new Date(Date.now()).toISOString());

  const pageInfo = pageLoader.use();

  console.log("component$ pageInfo", pageInfo.value.now);

  return (
    <div>
      <h1>
        Qwik <span class="lightning">⚡️</span>
      </h1>

      <p>
        Now: <span id="now">{pageInfo.value.now}</span>
      </p>

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
