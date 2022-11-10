import { component$, Resource } from "@builder.io/qwik";
import {
  DocumentHead,
  RequestHandler,
  useEndpoint,
} from "@builder.io/qwik-city";
import { Link } from "@builder.io/qwik-city";

export default component$(() => {
  const resource = useEndpoint<typeof onGet>();

  return (
    <div>
      <h1>
        Qwik <span class="lightning">⚡️</span>
      </h1>

      <Resource
        value={resource}
        onPending={() => <div>Loading...</div>}
        onRejected={() => <div>Failed to load resource</div>}
        onResolved={(r) => {
          return <div>Now: {r.now}</div>;
        }}
      />

      <Link class="mindblow" href="/flower">
        Blow my mind 🤯
      </Link>
    </div>
  );
});

export const onGet: RequestHandler<{ now: number }> = () => {
  return {
    now: Date.now(),
  };
};

export const head: DocumentHead = {
  title: "Welcome to Qwik",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
};
