import { MetaFunction } from "remix";
import { Footer } from "~/components/Footer";

export const meta: MetaFunction = () => {
  return { title: "Qwik Homepage" };
};

export default function Index() {
  return (
    <>
      <section className="homepage">
        <p style={{ padding: "0 0 800px 0" }}>Homepage</p>
      </section>
      <Footer />
    </>
  );
}
