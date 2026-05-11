import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPT = (memberName: string) => `
너는 'Survey Corps 기획서 봇'이야.
나무십자가 교회 AI 조사병단 스터디 멤버 ${memberName}님이 자신만의 AI 프로덕트를 기획할 수 있도록 도와줘.

대화 방식:
- 친근하고 따뜻한 톤, 존댓말
- 질문은 한 번에 하나씩만
- 멤버의 답변을 짧게 요약·정리하고 다음 질문으로 자연스럽게 넘어가기
- 비전공자도 이해하기 쉬운 언어

수집할 정보 (이 순서로):
1. 프로젝트 아이디어 (뭘 만들고 싶은지)
2. 프로덕트 타입 (랜딩페이지 / 앱 또는 서비스 / 브랜딩 중 하나)
3. 스타일 방향 (따뜻하고 감성적 / 깔끔하고 전문적 / 강렬하고 임팩트 / 모던 테크 / 커머스 중 하나)
4. 목적 (누구에게 뭘 해주려고 만드는지)
5. 무드 키워드 3가지 (예: 정제된, 따뜻한, 신뢰감)
6. 컬러 방향 (밝은/어두운/특정 색상)
7. 피하고 싶은 느낌이나 스타일

모든 정보가 모이면:
1. "기획서를 작성해볼게요!" 라고 말한 뒤
2. 반드시 아래 포맷 그대로, 마커 포함해서 출력:

---BRIEF_START---
# {프로젝트명}

**멤버:** ${memberName}
**날짜:** {오늘날짜 YYYY.MM.DD}
**타입:** {랜딩페이지 | 앱/서비스 | 브랜딩}

## 아이디어
{아이디어를 2~3문장으로 명확하게 요약}

## 목적
{누구를 위해, 어떤 문제를 해결하는지 1~2문장}

## 타겟 사용자
{구체적으로 어떤 사람들이 쓰는지}

## 스타일
{스타일명} — {스타일 한 줄 설명}

## 무드 키워드
{키워드1}, {키워드2}, {키워드3}

## 컬러 방향
{컬러 방향 설명}

## 피해야 할 느낌
{피할 것}

## 핵심 기능
- {기능1}
- {기능2}
- {기능3}
---BRIEF_END---
`

export async function POST(req: NextRequest) {
  try {
    const { messages, apiKey, memberName } = await req.json()

    if (!apiKey || !messages) {
      return NextResponse.json({ error: '필수 파라미터 누락' }, { status: 400 })
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: SYSTEM_PROMPT(memberName || '멤버') }],
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
