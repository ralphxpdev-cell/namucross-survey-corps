import { NextRequest, NextResponse } from 'next/server'

const GITHUB_TOKEN = process.env.GITHUB_TOKEN!
const GITHUB_OWNER = process.env.GITHUB_OWNER!
const GITHUB_REPO  = process.env.GITHUB_REPO!

async function putFile(path: string, content: string, message: string) {
  const encoded = Buffer.from(content, 'utf-8').toString('base64')

  // 기존 SHA 확인
  let sha: string | undefined
  const check = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodeURIComponent(path)}`,
    { headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: 'application/vnd.github+json' } }
  )
  if (check.ok) sha = (await check.json()).sha

  const body: Record<string, unknown> = {
    message,
    content: encoded,
    committer: { name: 'Survey Corps Bot', email: 'bot@namucross.kr' },
  }
  if (sha) body.sha = sha

  return fetch(
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
}

export async function POST(req: NextRequest) {
  try {
    const { memberName, briefContent, configContent } = await req.json()
    if (!memberName || !briefContent) {
      return NextResponse.json({ error: '필수 파라미터 누락' }, { status: 400 })
    }

    const now  = new Date()
    const date = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`
    const time = `${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}`
    const folder = `members/${memberName}/brief_${date}_${time}`
    const commitMsg = `📋 ${memberName} — 기획서 제출 (${date})`

    // _brief.md 저장
    const briefRes = await putFile(`${folder}/_brief.md`, briefContent, commitMsg)
    if (!briefRes.ok) {
      const err = await briefRes.json()
      return NextResponse.json({ error: err.message || 'brief 저장 실패' }, { status: briefRes.status })
    }
    const briefData = await briefRes.json()

    // _config.json 저장 (있을 때만)
    let configUrl = ''
    if (configContent) {
      const configRes = await putFile(`${folder}/_config.json`, configContent, commitMsg)
      if (configRes.ok) {
        const configData = await configRes.json()
        configUrl = configData.content?.html_url || ''
      }
    }

    return NextResponse.json({
      success: true,
      folder,
      briefUrl:  briefData.content?.html_url || '',
      configUrl,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
}
