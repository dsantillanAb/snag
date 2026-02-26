"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    ZapIcon,
    Loading02Icon,
    CheckmarkCircle01Icon,
    ArrowRight01Icon,
    GlobeIcon,
    AiBeautifyIcon,
    Search01Icon,
    Delete02Icon,
    PlusSignCircleIcon
} from "@hugeicons/core-free-icons";
import { scraperApi } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function CreateScraper() {
    const router = useRouter();
    const [url, setUrl] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [suggestions, setSuggestions] = useState<any>(null);

    const [limitArticles, setLimitArticles] = useState(10);
    const [fetchFullContent, setFetchFullContent] = useState(false);
    const [waitTime, setWaitTime] = useState(2000);
    const [contentType, setContentType] = useState("news");
    const [showAdvanced, setShowAdvanced] = useState(false);
    
    // Credenciales de autenticación
    const [requiresAuth, setRequiresAuth] = useState(false);
    const [authUsername, setAuthUsername] = useState("");
    const [authPassword, setAuthPassword] = useState("");
    const [loginUrl, setLoginUrl] = useState("");
    const [usernameSelector, setUsernameSelector] = useState("");
    const [passwordSelector, setPasswordSelector] = useState("");
    const [submitSelector, setSubmitSelector] = useState("");

    const messages = [
        "Analizando estructura del sitio...",
        "Identificando elementos dinámicos...",
        "Analizando jerarquía del DOM...",
        "Extrayendo selectores óptimos...",
        "Validando datos con IA...",
        "Casi estamos listos...",
        "Dando los toques finales..."
    ];

    const handleAnalyze = async () => {
        if (!url) return;
        setIsAnalyzing(true);
        setSuggestions(null);
        let msgIndex = 0;
        setLoadingMessage(messages[0]);

        const interval = setInterval(() => {
            msgIndex = (msgIndex + 1) % messages.length;
            setLoadingMessage(messages[msgIndex]);
        }, 3000);

        try {
            const response = await scraperApi.analyze(url);
            setSuggestions(response.data.suggestions);
        } catch (error) {
            console.error("Analysis failed", error);
            toast.error("Error al analizar el sitio", {
                description: "Verifica que la URL sea válida y accesible.",
            });
        } finally {
            clearInterval(interval);
            setIsAnalyzing(false);
        }
    };

    const handleCreate = async () => {
        if (!suggestions || !url) return;

        try {
            const domain = new URL(url).hostname.replace('www.', '').split('.')[0];
            const scraperData = {
                name: domain.charAt(0).toUpperCase() + domain.slice(1),
                url: url,
                selector_config: suggestions.reduce((acc: any, curr: any) => {
                    acc[curr.name] = curr.selector;
                    return acc;
                }, {}),
                limit_articles: limitArticles,
                fetch_full_content: fetchFullContent,
                wait_time: waitTime,
                schedule: "@daily",
                // Credenciales de autenticación
                auth_required: requiresAuth,
                auth_username: requiresAuth ? authUsername : null,
                auth_password: requiresAuth ? authPassword : null,
                auth_type: requiresAuth ? "form" : null,
                login_url: requiresAuth ? loginUrl : null,
                login_selectors: requiresAuth ? {
                    username_field: usernameSelector || 'input[name="username"], input[type="email"]',
                    password_field: passwordSelector || 'input[name="password"], input[type="password"]',
                    submit_button: submitSelector || null
                } : null
            };

            await scraperApi.create(scraperData);
            toast.success("¡Endpoint creado con éxito!", {
                description: "Ya puedes empezar a consumir tus datos.",
            });
            router.push("/endpoints");
        } catch (error) {
            console.error("Creation failed", error);
            toast.error("Error al crear el endpoint", {
                description: "Hubo un problema al guardar la configuración.",
            });
        }
    };

    return (
        <div className="container mx-auto max-w-4xl py-12 px-4">
            <div className="flex flex-col gap-2 mb-10">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                        <HugeiconsIcon icon={PlusSignCircleIcon} size={24} className="text-primary" />
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Crear Nuevo Scraper</h1>
                </div>
                <p className="text-muted-foreground text-lg">
                    Define un nuevo punto de extracción de datos en segundos.
                </p>
            </div>

            <Card className="mb-10 border-border/50 bg-background/60 backdrop-blur-sm shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-black" />
                <CardHeader className="pb-4">
                    <CardTitle className="text-xl">Destino de Extracción</CardTitle>
                    <CardDescription className="text-base">
                        Ingresa la URL del sitio web que deseas convertir en una API.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                <HugeiconsIcon icon={GlobeIcon} size={18} />
                            </div>
                            <Input
                                placeholder="https://ejemplo.com/productos"
                                value={url}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
                                className="pl-10 h-11 border-border/60 focus-visible:ring-primary/30"
                            />
                        </div>
                        <Button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing || !url}
                            className="h-11 px-6 gap-2 font-semibold shadow-lg shadow-primary/20"
                        >
                            {isAnalyzing ? (
                                <>
                                    <HugeiconsIcon icon={Loading02Icon} size={18} className="animate-spin" />
                                    Analizando...
                                </>
                            ) : (
                                <>
                                    <HugeiconsIcon icon={Search01Icon} size={18} />
                                    Analizar Sitio
                                </>
                            )}
                        </Button>
                    </div>

                    <div className="pt-4 border-t border-border/40">
                        <button
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="w-full flex items-center justify-between text-sm font-bold mb-2 text-primary/80 hover:text-primary transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <HugeiconsIcon icon={ZapIcon} size={16} />
                                Configuración Avanzada
                            </div>
                            <span className={`transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>▼</span>
                        </button>

                        {showAdvanced && (
                            <div className="space-y-6 mt-4 animate-in slide-in-from-top-2 duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tipo de Contenido</label>
                                        <select
                                            value={contentType}
                                            onChange={(e) => setContentType(e.target.value)}
                                            className="w-full h-9 bg-black/20 border border-border/40 rounded-md px-3 text-sm"
                                        >
                                            <option value="news">Noticias / Blogs</option>
                                            <option value="products">Productos / E-commerce</option>
                                            <option value="listings">Listados Real Estate</option>
                                            <option value="general">General / Corporativo</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Límite</label>
                                        <Input
                                            type="number"
                                            value={limitArticles}
                                            onChange={(e) => setLimitArticles(parseInt(e.target.value))}
                                            className="h-9 bg-black/20 border-border/40"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Espera (ms)</label>
                                        <Input
                                            type="number"
                                            step="500"
                                            value={waitTime}
                                            onChange={(e) => setWaitTime(parseInt(e.target.value))}
                                            className="h-9 bg-black/20 border-border/40"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3 pt-6">
                                        <input
                                            type="checkbox"
                                            id="deep"
                                            checked={fetchFullContent}
                                            onChange={(e) => setFetchFullContent(e.target.checked)}
                                            className="h-4 w-4 rounded border-border/40 bg-black/20 accent-primary"
                                        />
                                        <label htmlFor="deep" className="text-sm font-bold cursor-pointer select-none">Extraer Todo</label>
                                    </div>
                                </div>

                                {/* Sección de Autenticación */}
                                <div className="pt-4 border-t border-border/40">
                                    <div className="flex items-center gap-3 mb-4">
                                        <input
                                            type="checkbox"
                                            id="requiresAuth"
                                            checked={requiresAuth}
                                            onChange={(e) => setRequiresAuth(e.target.checked)}
                                            className="h-4 w-4 rounded border-border/40 bg-black/20 accent-primary"
                                        />
                                        <label htmlFor="requiresAuth" className="text-sm font-bold cursor-pointer select-none">
                                            🔐 Requiere Autenticación
                                        </label>
                                    </div>

                                    {requiresAuth && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg border border-border/40 bg-muted/20">
                                            <div className="space-y-2 md:col-span-2">
                                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">URL de Login</label>
                                                <Input
                                                    type="url"
                                                    placeholder="https://ejemplo.com/login"
                                                    value={loginUrl}
                                                    onChange={(e) => setLoginUrl(e.target.value)}
                                                    className="h-9 bg-black/20 border-border/40"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Usuario</label>
                                                <Input
                                                    type="text"
                                                    placeholder="usuario@ejemplo.com"
                                                    value={authUsername}
                                                    onChange={(e) => setAuthUsername(e.target.value)}
                                                    className="h-9 bg-black/20 border-border/40"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Contraseña</label>
                                                <Input
                                                    type="password"
                                                    placeholder="••••••••"
                                                    value={authPassword}
                                                    onChange={(e) => setAuthPassword(e.target.value)}
                                                    className="h-9 bg-black/20 border-border/40"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Selector de Usuario</label>
                                                <Input
                                                    type="text"
                                                    placeholder="#username, input[name='email']"
                                                    value={usernameSelector}
                                                    onChange={(e) => setUsernameSelector(e.target.value)}
                                                    className="h-9 bg-black/20 border-border/40"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Selector de Contraseña</label>
                                                <Input
                                                    type="text"
                                                    placeholder="#password, input[type='password']"
                                                    value={passwordSelector}
                                                    onChange={(e) => setPasswordSelector(e.target.value)}
                                                    className="h-9 bg-black/20 border-border/40"
                                                />
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Selector de Botón Submit (Opcional)</label>
                                                <Input
                                                    type="text"
                                                    placeholder="button[type='submit'], #login-btn"
                                                    value={submitSelector}
                                                    onChange={(e) => setSubmitSelector(e.target.value)}
                                                    className="h-9 bg-black/20 border-border/40"
                                                />
                                                <p className="text-xs text-muted-foreground">Si no se especifica, se buscará automáticamente el botón de login</p>
                                            </div>
                                            <div className="md:col-span-2 text-xs text-muted-foreground bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                                                <strong>Nota:</strong> Las credenciales se almacenan de forma segura y solo se usan para acceder al contenido protegido.
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {isAnalyzing && (
                <div className="flex flex-col items-center justify-center py-16 animate-in fade-in zoom-in duration-500">
                    <div className="relative mb-8">
                        <div className="h-20 w-20 rounded-full bg-primary/5 p-1 flex items-center justify-center">
                            <img
                                src="/img/logosinfondo.png"
                                alt="Snag AI"
                                className="h-16 w-16 object-contain animate-spin-slow"
                            />
                        </div>
                        <div className="absolute -inset-4 h-28 w-28 bg-primary/5 rounded-full animate-ping -z-10" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">snaging...</h3>
                    <p className="text-muted-foreground text-center max-w-sm">
                        {loadingMessage}
                    </p>
                </div>
            )}

            {suggestions && (
                <Card className="animate-in fade-in slide-in-from-bottom-6 duration-500 border-border/50 bg-background backdrop-blur-sm shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-black" />
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <HugeiconsIcon icon={CheckmarkCircle01Icon} size={80} className="text-emerald-500" />
                    </div>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <HugeiconsIcon icon={CheckmarkCircle01Icon} size={20} className="text-emerald-500" />
                            Análisis Completado
                        </CardTitle>
                        <CardDescription className="text-base font-medium">
                            Hemos identificado los siguientes campos listos para la extracción.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-xl border border-white/5 bg-[#0a0a0a] shadow-inner overflow-hidden">
                            <div className="flex items-center gap-1.5 px-4 py-2 border-b border-white/5 bg-[#111111]">
                                <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                                <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
                                <span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
                                <span className="ml-2 text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Esquema sugerido</span>
                            </div>
                            <div className="p-5 font-mono text-sm overflow-auto max-h-[400px]">
                                <pre className="text-emerald-400 leading-relaxed">
                                    {JSON.stringify(suggestions, null, 2)}
                                </pre>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                        <Button
                            variant="ghost"
                            onClick={() => setSuggestions(null)}
                            className="gap-2 px-6 h-11 text-muted-foreground hover:text-destructive"
                        >
                            <HugeiconsIcon icon={Delete02Icon} size={18} />
                            Descartar
                        </Button>
                        <Button
                            onClick={handleCreate}
                            className="gap-2 px-8 h-11 font-bold shadow-xl shadow-primary/20"
                        >
                            Generar Endpoint
                            <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
                        </Button>
                    </CardFooter>
                </Card>
            )}
        </div>
    );
}
