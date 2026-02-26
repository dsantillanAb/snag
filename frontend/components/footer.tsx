"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    ZapIcon,
    GithubIcon,
    ApiIcon,
} from "@hugeicons/core-free-icons";

export default function Footer() {
    return (
        <footer className="border-t bg-background/60 backdrop-blur-sm">
            <div className="container mx-auto px-4 md:px-6 py-4 flex flex-col gap-2 sm:flex-row items-center">
                <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={ZapIcon} size={14} className="text-primary" />
                    <p className="text-xs text-muted-foreground">© 2026 Snag. MIT License.</p>
                </div>
                <nav className="sm:ml-auto flex gap-5">
                    <Link
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors hover:underline underline-offset-4"
                        href="https://github.com/dsantillanAb/snag"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <HugeiconsIcon icon={GithubIcon} size={12} />
                        GitHub
                    </Link>
                    <Link
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors hover:underline underline-offset-4"
                        href="#"
                    >
                        <HugeiconsIcon icon={ApiIcon} size={12} />
                        API Docs
                    </Link>
                </nav>
            </div>
        </footer>
    );
}
