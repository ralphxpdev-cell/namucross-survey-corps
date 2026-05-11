import { NextRequest, NextResponse } from 'next/server'

const GITHUB_TOKEN = process.env.GITHUB_TOKEN!
const GITHUB_OWNER = process.env.GITHUB_OWNER!
const GITHUB_REPO  = process.env.GITHUB_REPO!

export async function POST(req: NextRequest) {
  try {
    const { memberName, briefContent } = await req.json()

    if (!memberName || !briefContent) {
      return NextResponse.json({ error: '필수 파라미터 누락' }, { status: 400 })
    }

    const now  = new Date()
    const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
    const time = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`
    const path = `members/${memberName}/brief_${date}_${time}.md`

    // 기존 파일 SHA 확인 (업데이트 시 필요)
    let sha: string | undefined
    const checkRes = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodeURIComponent(path)}`,
      { headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: 'application/vnd.github+json' } }
    )
    if (checkRes.ok) {
      const existing = await checkRes.json()
      sha = existing.sha
    }

    const content = Buffer.from(briefContent, 'utf-8').toString('base64')

    const body: Record<string, unknown> = {
      message: `📋 ${memberName} — 기획서 제출 (${date})`,
      content,
      committer: { name: 'Survey Corps Bot', email: 'bot@namucross.kr' },
    }
    if (sha) body.sha = sha

    const pushRes = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodeURIComponent(path)}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    )

    if (!pushRes.ok) {
      const err = await pushRes.json()
      return NextResponse.json({ error: err.message || 'GitHub 저장 실패' }, { status: pushRes.status })
    }

    const result = await pushRes.json()
    return NextResponse.json({
      success: true,
      path,
      url: result.content?.html_url,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
}
