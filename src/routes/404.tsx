import { component$ } from "@builder.io/qwik";
import { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  return (
    <div>
      <h1>404!!!!</h1>
    </div>
  );
});

export const head: DocumentHead = {
  title: "404!!!!",
};
