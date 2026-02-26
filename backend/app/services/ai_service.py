from openai import AsyncOpenAI
from app.core.config import settings

class AIService:
    def __init__(self):
        # Sanitize endpoint: strip common paths that the OpenAI client appends internally
        base_url = settings.AI_ENDPOINT
        if base_url:
            base_url = base_url.replace("/chat/completions", "").replace("/v1", "")
            
        self.client = AsyncOpenAI(
            api_key=settings.AI_API_KEY,
            base_url=base_url
        )
        self.model = settings.AI_MODEL

    async def analyze_html(self, html_content: str, url: str):
        prompt = f"""
        Analyze the following HTML from {url} and identify what type of content it contains.
        
        CRITICAL: Look at the URL and HTML structure carefully to determine the page type.
        
        STEP 1: DETECT PAGE TYPE
        Look for these specific indicators:
        
        E-COMMERCE (products for sale):
        - Price indicators: $, €, RD$, .price, .product-price, [class*="precio"]
        - Product grids: .product-grid, .products, .product-list
        - Shopping features: "add to cart", "buy now", shopping cart icon
        - Product cards with: name + price + image together
        - Inventory/stock indicators
        
        BLOG/NEWS (articles/posts):
        - Publication dates: <time>, .published, .date
        - Author names: .author, .by-line
        - Article structure: .post, .article, .entry
        - Read more links, comment sections
        
        PROMOTIONAL BANNERS (NOT products):
        - Large hero images, carousels, sliders
        - Marketing copy without prices
        - .banner, .slider, .hero, .promo
        
        STEP 2: IDENTIFY CORRECT SELECTORS
        
        For E-COMMERCE, find the PRODUCT CONTAINER first, then extract:
        - Product Name: Look inside product cards for h2, h3, .product-name, .product-title, a.product-link
        - Product Price: .price, .product-price, span[class*="price"], [class*="precio"]
        - Product URL: a[href] that wraps the product or leads to product detail
        - Product Image: img inside product card (NOT banner images)
        - Product SKU/ID: [data-product-id], .sku (optional)
        
        IMPORTANT FOR E-COMMERCE:
        - IGNORE promotional banners, hero sections, and sliders
        - Focus on repeating product cards/items in a grid or list
        - Each product MUST have at least: name, price, and link
        - Look for containers like: .product-item, .product-card, [class*="product"]
        
        For BLOG/NEWS:
        - Article Title: h1, h2, .entry-title, .post-title
        - Article URL: a[href] to full article
        - Article Excerpt: .excerpt, .summary
        - Article Image: .thumbnail img, .featured-image
        - Article Date: time, .date, .published
        
        STEP 3: RETURN JSON
        {{
          "page_type": "ecommerce" | "blog" | "news" | "promotional" | "other",
          "confidence": "high" | "medium" | "low",
          "detected_patterns": ["list of HTML patterns found"],
          "suggestions": [
            {{
              "name": "Product Name" (for ecommerce) or "Article Title" (for blog),
              "selector": "CSS selector",
              "type": "text" | "image_url" | "link" | "price" | "date"
            }}
          ]
        }}
        
        RULES:
        - Use "Product " prefix ONLY for actual products with prices
        - Use "Article " prefix for blog/news content
        - If you see banners/sliders without prices, mark as "promotional" not "ecommerce"
        - Be SPECIFIC with selectors - test that they target the right elements
        
        HTML Content:
        {html_content[:20000]}
        """
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an expert web scraper that returns only JSON."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=2000,
                response_format={"type": "json_object"}
            )
            import json
            content = response.choices[0].message.content
            try:
                data = json.loads(content)
                # Retornar el objeto completo con page_type, confidence y suggestions
                if "suggestions" in data:
                    return data
                else:
                    # Compatibilidad con respuestas antiguas
                    return {"suggestions": data, "page_type": "unknown", "confidence": "low"}
            except:
                return {"error": "Failed to parse AI response", "raw": content}
        except Exception as e:
            return {"error": f"AI service error: {str(e)}"}

ai_service = AIService()
