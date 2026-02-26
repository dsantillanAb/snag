"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    ZapIcon,
    GridViewIcon,
    PlusSignCircleIcon,
    GithubIcon,
    Logout02Icon,
    UserCircleIcon,
    Settings02Icon,
    DollarCircleIcon,
} from "@hugeicons/core-free-icons";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
    const { data: session, status } = useSession();

    return (
        <header className="h-14 border-b flex items-center sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
            <div className="container mx-auto px-4 lg:px-6 flex items-center w-full gap-4">
                <Link className="flex items-center justify-center gap-2 group shrink-0" href="/">
                    <div className="relative h-11 w-11 transition-transform group-hover:scale-110 duration-300">
                        <Image
                            src="/img/logosinfondo.png"
                            alt="Snag Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <span className="font-extrabold text-2xl tracking-tighter hidden xs:block text-foreground">
                        Snag
                    </span>
                </Link>

                {status === "authenticated" ? (
                    <nav className="flex items-center gap-1">
                        <Link
                            className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                            href="/endpoints"
                        >
                            <HugeiconsIcon icon={GridViewIcon} size={15} />
                            Endpoints
                        </Link>
                        <Link
                            className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                            href="/create"
                        >
                            <HugeiconsIcon icon={PlusSignCircleIcon} size={15} />
                            Crear
                        </Link>
                    </nav>
                ) : (
                    <nav className="flex items-center gap-1">
                        <Link
                            className="text-sm font-medium px-3 py-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                            href="/#caracteristicas"
                        >
                            Características
                        </Link>
                        <Link
                            className="text-sm font-medium px-3 py-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                            href="/#estadisticas"
                        >
                            Estadísticas
                        </Link>
                        <Link
                            className="text-sm font-medium px-3 py-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                            href="#precios"
                        >
                            Precios
                        </Link>
                    </nav>
                )}

                {/* Auth section */}
                <div className="ml-auto flex items-center gap-2">
                    {status === "loading" && (
                        <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                    )}

                    {status === "unauthenticated" && (
                        <Button asChild size="sm" className="gap-2 bg-black text-white hover:bg-zinc-800 border-0 dark:bg-white dark:text-black dark:hover:bg-zinc-100">
                            <Link href="/login">
                                <HugeiconsIcon icon={GithubIcon} size={15} />
                                Iniciar sesión
                            </Link>
                        </Button>
                    )}

                    {status === "authenticated" && session?.user && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-background/50 backdrop-blur-md border border-border/40 shadow-sm hover:border-primary/30 transition-all group cursor-pointer">
                                    <div className="relative">
                                        {session.user.image ? (
                                            <div className="h-7 w-7 rounded-full overflow-hidden border border-border/50 shadow-inner">
                                                <Image
                                                    src={session.user.image}
                                                    alt={session.user.name ?? "User"}
                                                    width={28}
                                                    height={28}
                                                    className="object-cover"
                                                    unoptimized={true}
                                                />
                                            </div>
                                        ) : (
                                            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                                <HugeiconsIcon icon={UserCircleIcon} size={18} className="text-primary" />
                                            </div>
                                        )}
                                        <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-emerald-500 rounded-full border-2 border-background shadow-sm" />
                                    </div>
                                    <div className="flex flex-col -space-y-0.5">
                                        <span className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-tight leading-none">
                                            Conectado
                                        </span>
                                        <span className="text-sm font-bold truncate max-w-[100px] leading-tight">
                                            {(session.user as any).githubUsername || session.user.name}
                                        </span>
                                    </div>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuItem asChild>
                                    <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                                        <HugeiconsIcon icon={UserCircleIcon} size={16} />
                                        Mi Perfil
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/profile?tab=endpoints" className="flex items-center gap-2 cursor-pointer">
                                        <HugeiconsIcon icon={GridViewIcon} size={16} />
                                        Mis Endpoints
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/profile?tab=usage" className="flex items-center gap-2 cursor-pointer">
                                        <HugeiconsIcon icon={DollarCircleIcon} size={16} />
                                        Uso y Créditos
                                    </Link>
                                </DropdownMenuItem>
                                {(session.user as any).isAdmin && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                            <Link href="/profile?tab=admin" className="flex items-center gap-2 cursor-pointer text-primary">
                                                <HugeiconsIcon icon={Settings02Icon} size={16} />
                                                Administrar Usuarios
                                            </Link>
                                        </DropdownMenuItem>
                                    </>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => signOut({ callbackUrl: "/" })}
                                    className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                                >
                                    <HugeiconsIcon icon={Logout02Icon} size={16} />
                                    Cerrar sesión
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>
        </header>
    );
}
