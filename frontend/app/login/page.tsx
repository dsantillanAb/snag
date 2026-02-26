"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { GithubIcon, Loading02Icon, LockIcon, ShieldKeyIcon } from "@hugeicons/core-free-icons";

export default function LoginPage() {
    const [loading, setLoading] = useState(false);

    const handleGithubLogin = async () => {
        setLoading(true);
        await signIn("github", { callbackUrl: "/" });
    };

    return (
        <div className="min-h-[85vh] flex items-center justify-center relative overflow-hidden px-4">
            {/* Background orbs */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] -z-10 animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-violet-500/5 blur-[100px] -z-10 animate-pulse delay-700" />

            <div className="w-full max-w-md mx-auto">
                <div className="border border-border/50 rounded-3xl bg-background/40 backdrop-blur-md shadow-2xl overflow-hidden relative">
                    {/* Header gradient bar */}
                    <div className="h-1.5 w-full bg-black" />

                    <div className="p-10 flex flex-col items-center gap-8">
                        {/* Brand Icon */}
                        <div className="h-20 w-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner relative group">
                            <div className="absolute inset-0 bg-primary/5 rounded-3xl blur-md group-hover:blur-xl transition-all" />
                            <HugeiconsIcon icon={ShieldKeyIcon} size={36} className="text-primary relative z-10" />
                        </div>

                        {/* Text */}
                        <div className="text-center space-y-2">
                            <h1 className="text-3xl font-extrabold tracking-tight">Bienvenido a Snag</h1>
                            <p className="text-muted-foreground text-sm font-medium">
                                Conecta tu cuenta para empezar a extraer datos con IA.
                            </p>
                        </div>

                        {/* CTA Button */}
                        <Button
                            onClick={handleGithubLogin}
                            disabled={loading}
                            size="lg"
                            className="w-full gap-3 text-base font-bold h-14 bg-[#0a0a0a] hover:bg-black text-white shadow-xl shadow-black/10 border-none transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {loading ? (
                                <HugeiconsIcon
                                    icon={Loading02Icon}
                                    size={20}
                                    className="animate-spin"
                                />
                            ) : (
                                <HugeiconsIcon icon={GithubIcon} size={20} />
                            )}
                            {loading ? "Redirigiendo..." : "Iniciar sesión con GitHub"}
                        </Button>

                        {/* Divider with text */}
                        <div className="relative w-full">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border/50"></span>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background/20 px-2 text-muted-foreground font-bold tracking-widest backdrop-blur-sm">Seguridad</span>
                            </div>
                        </div>

                        {/* Info box */}
                        <div className="flex items-start gap-3 text-xs text-muted-foreground bg-muted/30 rounded-2xl px-5 py-4 w-full border border-border/40">
                            <HugeiconsIcon icon={LockIcon} size={14} className="mt-0.5 shrink-0 text-primary/60" />
                            <p className="leading-relaxed font-medium">
                                Usamos GitHub para tu seguridad. Solo accedemos a tu perfil público y correo.
                                No solicitamos permisos de escritura.
                            </p>
                        </div>
                    </div>
                </div>

                <p className="text-center mt-8 text-xs text-muted-foreground font-medium">
                    ¿No tienes cuenta? Se creará una automáticamente al iniciar sesión.
                </p>
            </div>
        </div>
    );
}
