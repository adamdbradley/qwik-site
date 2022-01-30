import { MetaFunction } from "remix";
import { Footer } from "~/components/Footer";

export const meta: MetaFunction = () => {
  return { title: "Qwik Homepage" };
};

export default function Index() {
  return (
    <>
      <section className="min-h-screen">
        <p>Homepage</p>
      </section>
      <Footer />
    </>
  );
}
