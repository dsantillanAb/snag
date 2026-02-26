from openai import AsyncOpenAI
from app.core.config import settings

class AIClient:
    def __init__(self):
        self.client = AsyncOpenAI(
            api_key=settings.AI_API_KEY,
            base_url=settings.AI_ENDPOINT
        )
        self.model = settings.AI_MODEL

    async def get_completion(self, prompt: str):
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "user", "content": prompt}
            ],
            max_tokens=4000
        )
        return response.choices[0].message.content

ai_client = AIClient()
