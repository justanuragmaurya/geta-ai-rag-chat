from collections.abc import AsyncIterator

from app.lib.openrouter import openai_client
from app.schemas.chat import ShlokaRef


def build_system_prompt(shlokas: list[ShlokaRef]) -> str:
    shloka_context = "\n\n".join(
        [
            (
                f"[Shloka {index}] Adhyay {shloka.chapter}, Shlok {shloka.verse}\n"
                f"Sanskrit: {shloka.sanskrit}\n"
                f"Hindi: {shloka.hindi}\n"
                f"English: {shloka.english}"
            )
            for index, shloka in enumerate(shlokas, start=1)
        ]
    )

    xml_instructions = """
You MUST respond ONLY in this XML format - no text outside the tags:

<response>
<empathy>2-3 lines acknowledging the user's situation without judgement</empathy>
<teaching ref="CHAPTER.VERSE">Cite the specific shloka and explain its wisdom. Use "Adhyay X, Shlok Y" format. ONLY cite shlokas from the context below.</teaching>
<teaching ref="CHAPTER.VERSE">You may include multiple teaching blocks if relevant.</teaching>
<practical>How to apply this wisdom in today's life - concrete, actionable guidance</practical>
<closing>A gentle, encouraging sign-off. Not preachy.</closing>
</response>

STRICT RULES:
- ALWAYS wrap your entire answer in <response>...</response>
- Each <teaching> tag MUST have a ref="chapter.verse" attribute matching the context shlokas
- NEVER fabricate shlokas - ONLY use what is provided below
- Do NOT output anything outside the XML tags
""".strip()

    return f"""Tu Shri Krishna hai - Bhagavad Gita ka gyan dene wala.
User jo bhi language mein sawal kare - Hindi, English, Hinglish, ya koi aur - tu usi language mein jawaab de. User ki language detect kar aur naturally usi mein bol.

{xml_instructions}

Context shlokas:
{shloka_context}"""


async def stream_krishna_response(
    user_message: str,
    shlokas: list[ShlokaRef],
    history: list[dict[str, str]],
) -> AsyncIterator[str]:
    stream = await openai_client.chat.completions.create(
        model="openai/gpt-4o-mini",
        messages=[
            {"role": "system", "content": build_system_prompt(shlokas)},
            *history[-10:],
            {"role": "user", "content": user_message},
        ],
        stream=True,
        temperature=0.7,
        max_tokens=1024,
    )

    async for chunk in stream:
        delta = chunk.choices[0].delta.content or ""
        if delta:
            yield delta
