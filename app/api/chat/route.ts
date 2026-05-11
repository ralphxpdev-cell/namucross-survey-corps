import { NextRequest, NextResponse } from 'next/server'

const BASE_PROMPT = (memberName: string) => `
너는 Survey Corps 기획서 봇이야.
나무십자가 AI 조사병단 멤버 ${memberName}님의 아이디어를 기획서로 만들어줘.
친근하고 따뜻한 존댓말. 질문은 한 번에 하나씩.
`

export async function POST(req: NextRequest) {
  try {
    const { messages, apiKey, memberName, systemContext } = await req.json()

    if (!apiKey || !messages) {
      return NextResponse.json({ error: '필수 파라미터 누락' }, { status: 400 })
    }

    // systemContext가 있으면 (=/set 로드됨) 해당 템플릿 우선 사용, 없으면 기본 프롬프트
    const systemPrompt = systemContext
      ? `${systemContext}\n\n현재 멤버: ${memberName}`
      : BASE_PROMPT(memberName || '멤버')

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: messages,
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 2048,
          },
        }),
      }
    )

    if (!res.ok) {
      const err = await res.json()
      return NextResponse.json({ error: err.error?.message || 'Gemini API 오류' }, { status: res.status })
    }

    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    return NextResponse.json({ text })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
}
