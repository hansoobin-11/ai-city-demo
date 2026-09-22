# SPACEBANK AI CITY Demo

전시용 1920×1080 오프라인 터치 데모 프로젝트입니다.

현재 상태는 **이관 전 골격**입니다. 기존 `.dc.html` 디자인을 한 번에 복제하지 않고, `docs/plans/`의 승인된 단계에 따라 도시 화면부터 작은 단위로 옮깁니다.

## 기술 구성

- Vanilla TypeScript
- Vite
- 외부 프레임워크 및 상태관리 라이브러리 없음
- 마우스, 터치, 펜을 Pointer Events로 통합
- 전시 실행은 `file://` 직접 열기가 아니라 localhost 사용

## 개발 실행

```powershell
npm install
npm run dev
```

브라우저에서 `http://127.0.0.1:5173`으로 접속합니다.

## 검증

```powershell
npm run typecheck
npm run build
npm run preview
```

## 주요 문서

- `docs/specs/requirements.md`: 구현 범위와 콘텐츠 기준
- `docs/plans/`: 승인된 단계별 구현 계획
- `docs/designs/`: 디자인 비교안과 결정 기록
- `docs/references/source-materials.md`: 기존 파일 및 솔루션 자료 위치

