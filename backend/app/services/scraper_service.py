import sys
import asyncio
import concurrent.futures
import re
from typing import Any
from bs4 import BeautifulSoup
from app.services.ai_service import ai_service


def _run_in_proactor_thread(coro):
    """
    Runs an async coroutine in a brand-new thread that has its own
    ProactorEventLoop. This bypasses the Windows SelectorEventLoop
    used by uvicorn which doesn't support subprocesses (needed by Playwright).
    """
    def thread_target():
        if sys.platform == "win32":
            loop = asyncio.ProactorEventLoop()
        else:
            loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            return loop.run_until_complete(coro)
        finally:
            loop.close()

    with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
        future = pool.submit(thread_target)
        return future.result()


async def _fetch_page_async(url: str) -> str:
    from playwright.async_api import async_playwright
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        )
        page = await context.new_page()
        try:
            await page.goto(url, wait_until="domcontentloaded", timeout=45000)
            await asyncio.sleep(2)
            content = await page.content()
        except Exception as e:
            content = ""
        finally:
            await browser.close()
    return content


async def _scrape_advanced_async(
    url: str, 
    selector_config: dict, 
    limit_articles: int = 10, 
    fetch_full_content: bool = False, 
    wait_time: int = 2000,
    auth_config: dict = None
) -> Any:
    from playwright.async_api import async_playwright
    from urllib.parse import urljoin
    import asyncio
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        )
        page = await context.new_page()
        
        try:
            # NIVEL 0: Autenticación (si es necesaria)
            if auth_config and auth_config.get('required'):
                login_url = auth_config.get('login_url')
                username = auth_config.get('username')
                password = auth_config.get('password')
                
                # Usar selectores personalizados si están disponibles
                login_selectors = auth_config.get('login_selectors', {})
                username_selector = login_selectors.get('username_field') or 'input[name="username"], input[type="email"], input[id*="user"], input[id*="email"]'
                password_selector = login_selectors.get('password_field') or 'input[name="password"], input[type="password"], input[id*="pass"]'
                submit_selector = login_selectors.get('submit_button')
                
                if login_url and username and password:
                    try:
                        # Navegar a la página de login
                        is_login_spa = '#!' in login_url or '#/' in login_url
                        
                        if is_login_spa:
                            await page.goto(login_url, wait_until="domcontentloaded", timeout=30000)
                            await asyncio.sleep(2)  # Esperar a que cargue el framework JS
                        else:
                            await page.goto(login_url, wait_until="networkidle", timeout=30000)
                            await asyncio.sleep(1)
                        
                        # Esperar a que aparezcan los campos de login
                        await page.wait_for_selector(username_selector, timeout=10000)
                        
                        # Llenar el formulario de login
                        await page.fill(username_selector, username)
                        await asyncio.sleep(0.5)
                        await page.fill(password_selector, password)
                        await asyncio.sleep(0.5)
                        
                        # Buscar y hacer clic en el botón de submit
                        if submit_selector:
                            # Usar el selector personalizado
                            await page.click(submit_selector)
                        else:
                            # Intentar encontrar el botón automáticamente
                            submit_button = await page.query_selector('button[type="submit"], input[type="submit"], button:has-text("Login"), button:has-text("Iniciar"), button:has-text("Entrar"), button:has-text("Ingresar")')
                            if submit_button:
                                await submit_button.click()
                            else:
                                # Si no hay botón, intentar submit del formulario
                                await page.keyboard.press("Enter")
                        
                        # Esperar a que se complete el login
                        await asyncio.sleep(3)
                        
                        # Para SPAs, esperar a que la navegación se complete
                        if is_login_spa:
                            await page.wait_for_load_state("networkidle", timeout=10000)
                        
                    except Exception as e:
                        print(f"Warning: Authentication failed: {e}")
                        # Continuar de todas formas, tal vez la página no requiera login
            
            # NIVEL 1: Página Principal
            # Para SPAs con hash routing (#!/), necesitamos esperar más tiempo
            is_hash_route = '#!' in url or '#/' in url
            
            if is_hash_route:
                # Para SPAs, esperar a que el DOM esté listo y luego dar tiempo extra para JS
                await page.goto(url, wait_until="domcontentloaded", timeout=45000)
                await asyncio.sleep(3)  # Espera inicial para que cargue el framework JS
                await page.wait_for_load_state("networkidle", timeout=30000)
                await asyncio.sleep(wait_time / 1000)  # Espera adicional configurada
            else:
                # Para páginas tradicionales
                await page.goto(url, wait_until="networkidle", timeout=45000)
                await asyncio.sleep(wait_time / 1000)
            
            # Identificar el tipo de items y sus selectores
            # Detectar prefijos: "Product ", "Article ", "Listing ", "Item "
            item_prefixes = ["Product ", "Article ", "Listing ", "Item "]
            detected_prefix = None
            
            for prefix in item_prefixes:
                if any(k.startswith(prefix) for k in selector_config.keys()):
                    detected_prefix = prefix
                    break
            
            # Si no se detecta prefijo, asumir "Article " por compatibilidad
            if not detected_prefix:
                detected_prefix = "Article "
            
            list_fields = {k: v for k, v in selector_config.items() if k.startswith(detected_prefix)}
            static_fields = {k: v for k, v in selector_config.items() if not k.startswith(detected_prefix)}
            
            final_data = {}
            
            # Scrapeo de campos estáticos (No listas) - estos van al nivel raíz
            if static_fields:
                for field, selector in static_fields.items():
                    try:
                        element = await page.query_selector(selector)
                        if element:
                            final_data[field] = (await element.inner_text()).strip()
                        else:
                            final_data[field] = None
                    except:
                        final_data[field] = None

            # Scrapeo de listas (Productos, Artículos, etc.) - estos van en un array
            items = []
            item_type_name = "articles"  # Default
            
            if list_fields:
                temp_data = {}
                for field, selector in list_fields.items():
                    elements = await page.query_selector_all(selector)
                    field_data = []
                    for el in elements[:limit_articles]:
                        val = ""
                        if "URL" in field or "href" in selector:
                            attr = await el.get_attribute("href")
                            val = urljoin(url, attr) if attr else ""
                        elif "Image" in field or "img" in selector:
                            val = await el.get_attribute("src") or await el.get_attribute("data-src") or ""
                        else:
                            val = (await el.inner_text()).strip()
                        field_data.append(val)
                    temp_data[field] = field_data
                
                max_len = max([len(v) for v in temp_data.values()]) if temp_data else 0
                for i in range(max_len):
                    item = {}
                    for field in list_fields:
                        key = field.replace(detected_prefix, "").lower().replace(" ", "_")
                        item[key] = temp_data[field][i] if i < len(temp_data[field]) else None
                    items.append(item)
                
                # Usar el nombre apropiado según el tipo detectado
                item_type_name = detected_prefix.strip().lower() + "s"  # "product" -> "products"
                # SIEMPRE devolver un array, incluso si está vacío
                final_data[item_type_name] = items
            else:
                # Si no hay list_fields, devolver un array vacío con el nombre por defecto
                final_data["items"] = []

            # NIVEL 2: Deep Scraping
            if fetch_full_content and item_type_name in final_data:
                for item in final_data[item_type_name]:
                    item_url = item.get("url")
                    if item_url and item_url.startswith("http"):
                        try:
                            sub_page = await context.new_page()
                            await sub_page.goto(item_url, wait_until="domcontentloaded", timeout=20000)
                            
                            # Selectores según el tipo de página
                            if detected_prefix == "Product ":
                                content_selectors = [
                                    ".product-description", ".product-details", ".description",
                                    ".product-info", ".specs", ".features", "main", ".content"
                                ]
                            else:
                                content_selectors = [
                                    ".entry-content", ".article-content", ".post-content", 
                                    "article", "main", ".content"
                                ]
                            
                            paragraphs = []
                            for sel in content_selectors:
                                p_elements = await sub_page.query_selector_all(f"{sel} p")
                                if p_elements:
                                    for p in p_elements:
                                        t = (await p.inner_text()).strip()
                                        if t: paragraphs.append(t)
                                    break
                            
                            item["full_content"] = "\n\n".join(paragraphs) if paragraphs else None
                            item["body_paragraphs"] = paragraphs
                            
                            await sub_page.close()
                        except:
                            pass
            
            return final_data if final_data else {"error": "No components found"}

        except Exception as e:
            return {"error": str(e)}
        finally:
            await browser.close()


class ScraperService:

    async def fetch_page_content(self, url: str) -> str:
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None,
            lambda: _run_in_proactor_thread(_fetch_page_async(url))
        )

    async def analyze_and_suggest(self, url: str):
        content = await self.fetch_page_content(str(url))
        if not content:
            return {"error": "No se pudo acceder al sitio"}

        soup = BeautifulSoup(content, "html.parser")
        for element in soup(["script", "style", "svg", "noscript", "iframe", "header", "footer", "nav"]):
            element.decompose()

        for tag in soup.find_all(True):
            tag.attrs = {k: v for k, v in tag.attrs.items() if k in ["class", "id", "href", "src"]}

        clean_html = soup.prettify()
        suggestions = await ai_service.analyze_html(clean_html[:15000], str(url))
        return suggestions

    async def scrape_data(
        self, 
        url: str, 
        selector_config: dict, 
        limit: int = 10, 
        fetch_full_content: bool = False,
        wait_time: int = 2000,
        auth_config: dict = None
    ) -> Any:
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None,
            lambda: _run_in_proactor_thread(
                _scrape_advanced_async(url, selector_config, limit, fetch_full_content, wait_time, auth_config)
            )
        )


scraper_service = ScraperService()
