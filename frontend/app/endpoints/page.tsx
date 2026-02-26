"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    ZapIcon,
    CopyIcon,
    Link02Icon,
    Delete02Icon,
    ViewIcon,
    PlusSignCircleIcon,
    ApiIcon,
    ArrowRight01Icon,
    Table01Icon,
    Loading02Icon
} from "@hugeicons/core-free-icons";
import { endpointApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function EndpointsList() {
    const [endpoints, setEndpoints] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchEndpoints = async () => {
            try {
                const response = await endpointApi.list();
                setEndpoints(response.data);
            } catch (error) {
                console.error("Failed to fetch endpoints", error);
                toast.error("Error al cargar los endpoints");
            } finally {
                setLoading(false);
            }
        };
        fetchEndpoints();
    }, []);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Slug copiado al portapapeles");
    };

    return (
        <div className="container mx-auto py-12 px-4 md:px-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                            <HugeiconsIcon icon={ApiIcon} size={24} className="text-primary" />
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight">Mis Endpoints</h1>
                    </div>
                    <p className="text-muted-foreground text-lg">
                        Gestiona y consume tus puntos de extracción de datos.
                    </p>
                </div>
                <Button
                    onClick={() => router.push("/create")}
                    className="gap-2 font-bold px-6 shadow-lg shadow-primary/20"
                >
                    <HugeiconsIcon icon={PlusSignCircleIcon} size={18} />
                    Crear Scraper
                </Button>
            </div>

            {/* Content */}
            <Card className="border-border/50 bg-background/60 backdrop-blur-sm shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-black" />
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                        <HugeiconsIcon icon={Table01Icon} size={18} className="text-primary" />
                        <CardTitle className="text-xl">Endpoints Activos</CardTitle>
                    </div>
                    <CardDescription className="text-base font-medium">
                        Consulta la documentación y el estado de tus canales de datos.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-xl border border-border/40 bg-muted/40 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/80">
                                <TableRow className="hover:bg-transparent border-white/5">
                                    <TableHead className="font-bold py-4 text-zinc-400">Nombre</TableHead>
                                    <TableHead className="font-bold py-4 text-zinc-400">Página Origen</TableHead>
                                    <TableHead className="font-bold py-4 text-zinc-400">Path</TableHead>
                                    <TableHead className="font-bold py-4 text-zinc-400">Uso</TableHead>
                                    <TableHead className="font-bold py-4 text-zinc-400">Estado</TableHead>
                                    <TableHead className="text-right font-bold py-4 text-zinc-400">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-20">
                                            <div className="flex flex-col items-center gap-3">
                                                <HugeiconsIcon icon={Loading02Icon} size={32} className="animate-spin text-primary/50" />
                                                <span className="text-muted-foreground font-medium">Cargando endpoints...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : endpoints.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-20">
                                            <div className="flex flex-col items-center gap-3">
                                                <HugeiconsIcon icon={ZapIcon} size={32} className="text-muted-foreground/30" />
                                                <span className="text-muted-foreground font-medium">Aún no has creado ningún scraper.</span>
                                                <Button variant="link" onClick={() => router.push("/create")} className="text-primary">
                                                    Empieza creando uno ahora
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    endpoints.map((ep) => (
                                        <TableRow
                                            key={ep.id}
                                            className="cursor-pointer hover:bg-muted/60 transition-colors group border-border/40"
                                            onClick={() => router.push(`/endpoints/${ep.endpoint_slug}`)}
                                        >
                                            <TableCell className="font-bold text-foreground">
                                                {ep.scraper_name || "Custom Scraper"}
                                            </TableCell>
                                            <TableCell className="max-w-[180px] lg:max-w-[250px] truncate underline italic text-primary/80 font-medium">
                                                <a
                                                    href={ep.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {ep.url}
                                                </a>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5">
                                                    <code className="bg-[#0a0a0a] text-emerald-400 px-2 py-0.5 rounded-md border border-white/5 font-mono text-xs">
                                                        /{ep.endpoint_slug}
                                                    </code>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-0.5">
                                                    <Badge variant={ep.request_count >= 1000 ? "destructive" : "default"} className="w-fit">
                                                        {ep.request_count}/1000
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">
                                                        ${(ep.credits_used || 0).toFixed(2)} gastados
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-2.5 py-0.5 gap-1.5 font-bold uppercase tracking-widest text-[10px]">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                    Activo
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        title="Ver detalles"
                                                        className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                                    >
                                                        <HugeiconsIcon icon={ViewIcon} size={18} />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        title="Copiar Slug"
                                                        className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            copyToClipboard(ep.endpoint_slug);
                                                        }}
                                                    >
                                                        <HugeiconsIcon icon={CopyIcon} size={18} />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        title="Eliminar"
                                                        className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            // delete logic
                                                            toast.error("Función de elminación en desarrollo");
                                                        }}
                                                    >
                                                        <HugeiconsIcon icon={Delete02Icon} size={18} />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
