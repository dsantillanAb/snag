"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    ZapIcon,
    PlayIcon,
    CodeIcon,
    CopyIcon,
    ArrowLeft01Icon,
    Loading02Icon,
    Link02Icon,
    DatabaseIcon,
    Table01Icon,
    Settings02Icon,
    Notification03Icon,
    SourceCodeIcon,
    SparklesIcon,
    FilterIcon,
    BookOpen01Icon
} from "@hugeicons/core-free-icons";
import { endpointApi } from "@/lib/api";
import { toast } from "sonner";

export default function EndpointDetail() {
    const { slug } = useParams();
    const router = useRouter();
    const [metadata, setMetadata] = useState<any>(null);
    const [results, setResults] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [executing, setExecuting] = useState(false);
    
    // Filtros
    const [limit, setLimit] = useState(10);
    const [fetchFullContent, setFetchFullContent] = useState(false);
    const [waitTime, setWaitTime] = useState(2000);

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const response = await endpointApi.getMetadata(slug as string);
                setMetadata(response.data);
            } catch (error) {
                console.error("Failed to fetch metadata", error);
                toast.error("Endpoint no encontrado");
                router.push("/endpoints");
            } finally {
                setLoading(false);
            }
        };
        fetchMetadata();
    }, [slug, router]);

    const handleExecute = async () => {
        setExecuting(true);
        setResults(null);
        try {
            const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/endpoints/scrape/${slug}?limit=${limit}&fetch_full_content=${fetchFullContent}&wait_time=${waitTime}`;
            const response = await fetch(url);
            const data = await response.json();
            setResults(data);
            toast.success("¡Scraping completado!");
        } catch (error) {
            console.error("Execution failed", error);
            toast.error("Error al ejecutar el scraping");
        } finally {
            setExecuting(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copiado al portapapeles");
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <HugeiconsIcon icon={Loading02Icon} size={48} className="text-primary animate-spin" />
                <p className="text-muted-foreground font-medium animate-pulse">Cargando detalles...</p>
            </div>
        );
    }

    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/endpoints/scrape/${slug}`;
    const apiUrlWithParams = `${apiUrl}?limit=${limit}&fetch_full_content=${fetchFullContent}&wait_time=${waitTime}`;
    const curlCommand = `curl -X GET "${apiUrlWithParams}"`;

    return (
        <div className="container mx-auto py-12 px-4 md:px-6 max-w-6xl">
            {/* Back button */}
            <Button
                variant="ghost"
                className="mb-8 group gap-2 px-0 hover:bg-transparent text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => router.push("/endpoints")}
            >
                <HugeiconsIcon icon={ArrowLeft01Icon} size={18} className="transition-transform group-hover:-translate-x-1" />
                Volver a la lista
            </Button>

            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-primary/10 border border-primary/20 shadow-inner">
                            <HugeiconsIcon icon={ZapIcon} size={28} className="text-primary" />
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight">{metadata?.scraper_name}</h1>
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3 py-1 font-bold">
                            ACTIVO
                        </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-lg border border-border/40 self-start">
                        <span className="text-xs font-bold uppercase tracking-widest opacity-60">Fuente:</span>
                        <a href={metadata?.url} target="_blank" className="text-sm font-medium underline hover:text-primary transition-colors truncate max-w-[200px] sm:max-w-md">
                            {metadata?.url}
                        </a>
                        <HugeiconsIcon icon={Link02Icon} size={14} className="opacity-60" />
                    </div>
                </div>
                <Button
                    size="lg"
                    onClick={handleExecute}
                    disabled={executing}
                    className="h-14 px-8 gap-3 font-bold text-lg shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    {executing ? (
                        <>
                            <HugeiconsIcon icon={Loading02Icon} size={24} className="animate-spin" />
                            Scrapeando...
                        </>
                    ) : (
                        <>
                            <HugeiconsIcon icon={PlayIcon} size={24} className="fill-current" />
                            Ejecutar Ahora
                        </>
                    )}
                </Button>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-8">
                    {/* Filtros Section */}
                    <Card className="border-border/50 bg-background/60 backdrop-blur-sm shadow-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <HugeiconsIcon icon={FilterIcon} size={20} className="text-primary" />
                                Parámetros de Consulta
                            </CardTitle>
                            <CardDescription className="text-base font-medium">
                                Personaliza la respuesta del endpoint con estos filtros
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-muted-foreground tracking-widest">
                                        Límite de resultados
                                    </label>
                                    <Input
                                        type="number"
                                        value={limit}
                                        onChange={(e) => setLimit(parseInt(e.target.value) || 10)}
                                        min={1}
                                        max={100}
                                        className="h-10"
                                    />
                                    <p className="text-xs text-muted-foreground">Máximo: 100</p>
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-muted-foreground tracking-widest">
                                        Tiempo de espera (ms)
                                    </label>
                                    <Input
                                        type="number"
                                        value={waitTime}
                                        onChange={(e) => setWaitTime(parseInt(e.target.value) || 2000)}
                                        min={1000}
                                        max={10000}
                                        step={500}
                                        className="h-10"
                                    />
                                    <p className="text-xs text-muted-foreground">1000-10000 ms</p>
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-muted-foreground tracking-widest">
                                        Contenido completo
                                    </label>
                                    <div className="flex items-center h-10 gap-2">
                                        <input
                                            type="checkbox"
                                            checked={fetchFullContent}
                                            onChange={(e) => setFetchFullContent(e.target.checked)}
                                            className="h-4 w-4"
                                        />
                                        <span className="text-sm">Extraer contenido completo</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Más lento pero más detallado</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Consumo Section */}
                    <Card className="border-border/50 bg-background/60 backdrop-blur-sm shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-black" />
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <HugeiconsIcon icon={SourceCodeIcon} size={20} className="text-primary" />
                                Integración del Endpoint
                            </CardTitle>
                            <CardDescription className="text-base font-medium">
                                Consume estos datos desde cualquier aplicación mediante una petición GET.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold uppercase text-muted-foreground tracking-widest pl-1 leading-none">URL del Endpoint</label>
                                    <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-tighter">Public API</span>
                                </div>
                                <div className="flex items-center gap-2 bg-[#0a0a0a] p-3 pl-4 rounded-xl border border-white/5 shadow-inner">
                                    <code className="text-sm font-mono truncate flex-1 text-emerald-400">{apiUrlWithParams}</code>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 text-zinc-500 hover:text-white"
                                        onClick={() => copyToClipboard(apiUrlWithParams)}
                                    >
                                        <HugeiconsIcon icon={CopyIcon} size={18} />
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-bold uppercase text-muted-foreground tracking-widest pl-1 leading-none">Ejemplo cURL</label>
                                <div className="bg-[#0a0a0a] rounded-xl border border-white/5 overflow-hidden group relative">
                                    <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/5 bg-[#111111]">
                                        <span className="h-2 w-2 rounded-full bg-zinc-700" />
                                        <span className="h-2 w-2 rounded-full bg-zinc-700" />
                                        <span className="h-2 w-2 rounded-full bg-zinc-700" />
                                        <span className="ml-2 text-[10px] text-zinc-600 font-mono font-bold uppercase tracking-widest">Terminal</span>
                                    </div>
                                    <div className="p-4 pr-12 font-mono text-sm overflow-x-auto text-zinc-300">
                                        <span className="text-emerald-500">curl</span> -X GET <span className="text-amber-400">"{apiUrlWithParams}"</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-10 right-2 h-8 w-8 text-zinc-600 hover:text-white sm:opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => copyToClipboard(curlCommand)}
                                    >
                                        <HugeiconsIcon icon={CopyIcon} size={16} />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Results Table Section */}
                    {results && (
                        <Card className="animate-in fade-in slide-in-from-bottom-8 duration-500 border-border/50 bg-background/60 backdrop-blur-sm shadow-2xl overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 bg-muted/20">
                                <div className="space-y-1">
                                    <CardTitle className="flex items-center gap-2">
                                        <HugeiconsIcon icon={SparklesIcon} size={20} className="text-amber-400" />
                                        Live Data Preview
                                    </CardTitle>
                                    <CardDescription>
                                        Capturado el {new Date(results.timestamp).toLocaleString('es-DO')}
                                    </CardDescription>
                                </div>
                                <Badge variant="secondary" className="font-mono font-bold text-xs px-3">JSON</Badge>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="bg-[#0a0a0a] min-h-[200px] max-h-[500px] overflow-auto">
                                    <pre className="p-6 text-sm font-mono leading-relaxed text-emerald-400 selection:bg-emerald-500/20">
                                        {JSON.stringify(results.data, null, 2)}
                                    </pre>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-muted/10 border-t border-border/40 py-3 flex justify-between">
                                <p className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                                    <HugeiconsIcon icon={ZapIcon} size={12} className="text-primary" />
                                    Créditos usados: ${results.usage?.cost || 0.03}
                                </p>
                                <Button variant="link" size="sm" className="h-auto p-0 text-xs font-bold h-6" onClick={() => handleExecute()}>
                                    Recargar datos
                                </Button>
                            </CardFooter>
                        </Card>
                    )}

                    {/* Manual de Uso */}
                    <Card className="border-border/50 bg-background/60 backdrop-blur-sm shadow-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <HugeiconsIcon icon={BookOpen01Icon} size={20} className="text-primary" />
                                Manual de Uso de la API
                            </CardTitle>
                            <CardDescription className="text-base font-medium">
                                Guía rápida para integrar este endpoint en tu aplicación
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-bold text-sm mb-2">1. Endpoint Base</h3>
                                    <code className="text-xs bg-muted px-2 py-1 rounded">{apiUrl}</code>
                                </div>

                                <div>
                                    <h3 className="font-bold text-sm mb-2">2. Parámetros de Query (Opcionales)</h3>
                                    <ul className="space-y-2 text-sm text-muted-foreground">
                                        <li>• <code className="bg-muted px-1 rounded">limit</code> - Número de resultados (1-100, default: 10)</li>
                                        <li>• <code className="bg-muted px-1 rounded">fetch_full_content</code> - Extraer contenido completo (true/false, default: false)</li>
                                        <li>• <code className="bg-muted px-1 rounded">wait_time</code> - Tiempo de espera en ms (1000-10000, default: 2000)</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="font-bold text-sm mb-2">3. Ejemplo de Respuesta</h3>
                                    <div className="bg-[#0a0a0a] rounded-lg p-4 text-xs font-mono text-emerald-400 overflow-x-auto">
                                        {`{
  "endpoint": "${slug}",
  "url": "${metadata?.url}",
  "data": { ... },
  "usage": {
    "request_count": 1,
    "remaining_requests": 999,
    "credits_remaining": 29.97,
    "cost": 0.03
  }
}`}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-bold text-sm mb-2">4. Ejemplos de Integración</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-xs font-bold text-muted-foreground mb-1">JavaScript/Fetch:</p>
                                            <div className="bg-[#0a0a0a] rounded-lg p-3 text-xs font-mono text-zinc-300 overflow-x-auto">
                                                {`fetch('${apiUrl}?limit=20')
  .then(res => res.json())
  .then(data => console.log(data));`}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-muted-foreground mb-1">Python/Requests:</p>
                                            <div className="bg-[#0a0a0a] rounded-lg p-3 text-xs font-mono text-zinc-300 overflow-x-auto">
                                                {`import requests
response = requests.get('${apiUrl}?limit=20')
data = response.json()`}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-bold text-sm mb-2">5. Límites y Costos</h3>
                                    <ul className="space-y-1 text-sm text-muted-foreground">
                                        <li>• Costo por request: $0.03 USD</li>
                                        <li>• Límite por endpoint: 1000 requests</li>
                                        <li>• Rate limit: 60 requests/minuto</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-8">
                    {/* Selectors Sidebar */}
                    <Card className="border-border/50 bg-background/60 backdrop-blur-sm shadow-xl">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <HugeiconsIcon icon={Settings02Icon} size={18} className="text-primary" />
                                Configuración IA
                            </CardTitle>
                            <CardDescription className="text-xs font-medium uppercase tracking-widest opacity-60">Schema Definitions</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {metadata?.selector_config && Object.entries(metadata.selector_config).map(([field, selector]: [string, any]) => (
                                <div key={field} className="p-3.5 rounded-xl border border-border/40 bg-muted/30 group hover:border-primary/30 transition-colors">
                                    <p className="text-[10px] font-extrabold text-primary uppercase tracking-[0.2em] mb-1.5">{field}</p>
                                    <p className="text-xs font-mono truncate text-muted-foreground group-hover:text-foreground transition-colors">{selector}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Pro Tip/Upcoming Sidebar */}
                    <Card className="border-none bg-zinc-900 text-white shadow-2xl overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                            <HugeiconsIcon icon={Notification03Icon} size={100} />
                        </div>
                        <CardHeader>
                            <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center mb-2">
                                <HugeiconsIcon icon={Notification03Icon} size={20} className="text-emerald-400" />
                            </div>
                            <CardTitle className="text-xl">Webhooks</CardTitle>
                            <CardDescription className="text-zinc-400">Próximamente disponible</CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm text-zinc-400 leading-relaxed font-medium">
                            Recibe notificaciones automáticas cada vez que los datos de tu endpoint cambien. No más polling manual.
                        </CardContent>
                        <CardFooter>
                            <Button disabled variant="outline" className="w-full border-zinc-700 text-zinc-500 hover:bg-zinc-800 font-bold bg-transparent">
                                Notificarme
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Platform metadata */}
                    <div className="px-4 py-3 rounded-xl border border-border/40 bg-muted/20 flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center border border-border/40">
                            <HugeiconsIcon icon={DatabaseIcon} size={16} className="text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground/60 leading-none mb-1">Database Cloud</p>
                            <p className="text-xs font-bold italic">PostgreSQL (Neon)</p>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
