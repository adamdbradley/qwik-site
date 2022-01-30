import { GithubLogo } from "./GithubLogo";
import { QwikLogo } from "./Logo";

export const Header = () => (
  <header className="relative p-4">
    <nav className="flex items-center justify-between flex-wrap">
      <div className="flex items-center flex-shrink-0 text-white mr-6">
        <QwikLogo />
      </div>
      <div className="flex justify-items-end flex-shrink-0 text-white ml-6">
        <GithubLogo />
      </div>
    </nav>
  </header>
);
