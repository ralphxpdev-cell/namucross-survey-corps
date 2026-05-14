import { NextRequest, NextResponse } from 'next/server'

const SC_URL = 'https://brief-maker.vercel.app'

// GET /api/launcher/[member] → .bat 파일 (더블클릭 실행용)
export async function GET(
  _req: NextRequest,
  { params }: { params: { member: string } }
) {
  const member = decodeURIComponent(params.member)
  const encoded = encodeURIComponent(member)

  const bat = `@echo off
chcp 65001 > nul
title Survey Corps — ${member}

echo.
echo  =============================================
echo   Survey Corps Pi 런처 — ${member}님
echo  =============================================
echo.

:: Node.js 확인
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [오류] Node.js가 없습니다.
    echo       https://nodejs.org 에서 설치 후 다시 실행하세요.
    echo.
    pause
    exit /b 1
)

:: 스크립트 다운로드 및 실행
set TMPSCRIPT=%TEMP%\\sc-start-${encoded}.mjs
powershell -NoProfile -Command "Invoke-WebRequest -Uri '${SC_URL}/api/launcher-script/${encoded}' -OutFile '%TMPSCRIPT%' -UseBasicParsing"
node "%TMPSCRIPT%"
del "%TMPSCRIPT%" 2>nul

echo.
pause
`

  return new NextResponse(bat, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="sc-start.bat"`,
    },
  })
}
