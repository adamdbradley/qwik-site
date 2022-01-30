import { MetaFunction } from "remix";
import { DocsMenu } from "~/components/DocsMenu";
import { Footer } from "~/components/Footer";

export const meta: MetaFunction = () => {
  return { title: "Qwik Documentation" };
};

export default function Docs() {
  return (
    <>
      <aside className="hidden lg:block fixed z-20 inset-0 top-[80px] left-[max(0px,calc(50%-40rem))] right-auto w-[19.5rem] pb-10 px-8 overflow-y-auto">
        <DocsMenu />
      </aside>
      <section className="lg:pl-[19.5rem] pt-4">
        <article className="max-w-3xl mx-auto xl:max-w-none xl:ml-0 xl:mr-[15.5rem] xl:pr-16 h-screen">
          <h1 className="font-extrabold text-2xl mb-4">Qwik Documentation</h1>
          <p>asdf</p>
          <p>asdf</p>
          <p>asdf</p>
          <p>asdf</p>
        </article>
        <Footer />
      </section>
    </>
  );
}
