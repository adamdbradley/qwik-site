import { MetaFunction } from "remix";

export const meta: MetaFunction = () => {
  return { title: "Qwik Homepage" };
};

export default function Index() {
  return <>Qwik Landing Page</>;
}
