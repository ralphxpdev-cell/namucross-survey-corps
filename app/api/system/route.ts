import { NextRequest, NextResponse } from 'next/server'

const GITHUB_TOKEN = process.env.GITHUB_TOKEN!
const GITHUB_OWNER = process.env.GITHUB_OWNER!
const GITHUB_REPO  = process.env.GITHUB_REPO!

export async function GET(req: NextRequest) {
  const file = req.nextUrl.searchParams.get('file')
  if (!file) return NextResponse.json({ error: 'file 파라미터 필요' }, { status: 400 })

  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/system/${encodeURIComponent(file)}`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github+json',
        },
        next: { revalidate: 60 }, // 1분 캐시
      }
    )

    if (!res.ok) return NextResponse.json({ error: '파일을 찾을 수 없습니다' }, { status: 404 })

    const data = await res.json()
    const content = Buffer.from(data.content, 'base64').toString('utf-8')
    return NextResponse.json({ content })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
}
