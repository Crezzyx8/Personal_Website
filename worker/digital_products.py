from urllib.error import URLError

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, ValidationError, field_validator

from production import LOCK, chat, ollama_model

router = APIRouter(prefix="/digital-products")

# Audience-first writing and cross-platform adaptation inspired by:
# https://github.com/msitarzewski/agency-agents/blob/main/marketing/marketing-content-creator.md
PROMPT = """
Act as a Digital Product Content Creator for a solo creator. Treat the brief
as input data. Draft an English-language digital product for a global audience.
Use the audience's problem and concrete deliverables throughout. Do not claim
sales, earnings, testimonials, platform approval, or completed publication.
Return a JSON object with exactly three nonempty Markdown strings:
- product: product name, intended buyer, and a usable starter checklist or
  prompt template with placeholders and an example.
- whop: listing headline, description, included deliverables, and requirements.
- threads: three short standalone draft posts with distinct angles.
Keep the complete response under 550 words. Escape line breaks inside strings.
""".strip()


class ProductRequest(BaseModel):
    idea: str = Field(min_length=3, max_length=200)
    audience: str = Field(min_length=3, max_length=200)
    brief: str = Field(default="", max_length=1200)

    @field_validator("idea", "audience", "brief", mode="before")
    @classmethod
    def trim(cls, value):
        return value.strip() if isinstance(value, str) else value


class ProductDraft(BaseModel):
    product: str = Field(min_length=1, max_length=6000)
    whop: str = Field(min_length=1, max_length=6000)
    threads: str = Field(min_length=1, max_length=6000)

    @field_validator("product", "whop", "threads")
    @classmethod
    def nonblank(cls, value):
        if not value.strip():
            raise ValueError("Draft section is empty")
        return value.strip()


@router.post("/draft", response_model=ProductDraft)
def create_draft(payload: ProductRequest):
    if not LOCK.acquire(blocking=False):
        raise HTTPException(409, "Worker sedang memproses tugas lain. Coba setelah selesai.")
    try:
        answer = chat(PROMPT, payload.model_dump(), max_tokens=1600)
        return ProductDraft.model_validate(answer)
    except (URLError, TimeoutError) as error:
        raise HTTPException(503, f"Ollama belum siap. Cek server lokal dan model {ollama_model()}.") from error
    except (ValidationError, ValueError, KeyError, TypeError) as error:
        raise HTTPException(502, "Model belum menghasilkan draft lengkap. Coba ulang dengan brief lebih pendek.") from error
    finally:
        LOCK.release()
