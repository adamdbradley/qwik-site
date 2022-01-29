import { QWIK_LOADER } from "../loader";

export const QwikLoader = () => (
  <script
    dangerouslySetInnerHTML={{
      __html: QWIK_LOADER,
    }}
  />
);
