import { Link } from "react-router-dom";
import { Github, Home, FileSignature } from "lucide-react";
import { Button } from "./ui/button";

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="font-semibold text-xl">
          Signit
        </Link>

        {/* Navigation Icons */}
        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/" title="Home">
              <Home className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link to="/signatures" title="Signatures">
              <FileSignature className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <a
              href="https://github.com/signitsa/embedded-poc"
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
          </Button>
        </nav>
      </div>
    </header>
  );
}
