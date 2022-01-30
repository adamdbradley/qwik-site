import { GithubLogo } from "./GithubLogo";
import { QwikLogo } from "./Logo";

export const Header = () => (
  <header className="sticky top-0 z-40 w-full flex-none p-4 bg-gray-900">
    <div className="flex justify-between flex-wrap max-w-7xl mx-auto">
      <div className="flex items-center flex-shrink-0 text-white mr-6">
        <QwikLogo />
      </div>
      <nav className="grow flex justify-end">
        <a
          className="font-semibold text-slate-400 hover:text-slate-500 px-2 mx-2"
          href="/docs"
        >
          Docs
        </a>
        <a
          className="font-semibold text-slate-400 hover:text-slate-500 px-2 ml-2"
          href="https://qwik-playground.builder.io/"
        >
          Playground
        </a>
      </nav>
      <div className="flex justify-items-end flex-shrink-0 text-white ml-6">
        <GithubLogo />
      </div>
    </div>
  </header>
);
