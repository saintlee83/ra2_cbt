# 의료기기 CBT 시험 시스템

Next.js 기반 의료기기 관련 CBT (Computer-Based Testing) 온라인 시험 시스템입니다.

## 주요 기능

- ✅ 한국어 인터페이스
- ✅ 다중 시험 선택
- ✅ 문제별 난이도 표시
- ✅ 실시간 답안 체크
- ✅ 상세한 해설 제공
- ✅ 문제 네비게이션
- ✅ 시험 결과 및 점수 확인
- ✅ 반응형 디자인 (모바일 지원)

## 시작하기

### 개발 서버 실행

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 프로덕션 빌드

```bash
npm run build
npm start
```

## 프로젝트 구조

```
cbt-app/
├── app/                    # Next.js App Router
│   ├── page.tsx           # 메인 페이지 (시험 목록)
│   ├── quiz/[filename]/   # 시험 페이지 (동적 라우트)
│   ├── results/           # 결과 페이지
│   └── layout.tsx         # 레이아웃
├── components/            # React 컴포넌트
│   └── QuizInterface.tsx  # 시험 인터페이스 컴포넌트
├── lib/                   # 유틸리티 함수
│   └── quiz-loader.ts     # 시험 데이터 로더
├── types/                 # TypeScript 타입 정의
│   └── quiz.ts            # 시험 관련 타입
└── public/                # 정적 파일
    └── quiz_sets/         # 시험 데이터 (JSON)
```

## 시험 데이터 추가

새로운 시험을 추가하려면 `public/quiz_sets/` 디렉토리에 JSON 파일을 추가하세요.

### JSON 형식 예시

```json
{
  "examTitle": "시험 제목",
  "questions": [
    {
      "id": 1,
      "difficulty": "중",
      "question": "문제 내용",
      "options": [
        "선택지 1",
        "선택지 2",
        "선택지 3",
        "선택지 4"
      ],
      "correctAnswer": 0,
      "explanation": "정답 해설",
      "reference": "참고 자료"
    }
  ]
}
```

## 기술 스택

- **Framework**: Next.js 16.0 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Runtime**: Node.js

## 배포

### Vercel (권장)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

Vercel을 통해 간편하게 배포할 수 있습니다.

## 라이선스

MIT License
