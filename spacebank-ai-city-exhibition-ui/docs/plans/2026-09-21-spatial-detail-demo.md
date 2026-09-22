# 공간형 상세 데모 연출 구현 계획

**목표:** 상세 도메인 구간에서 화면 캡처가 슬라이드쇼처럼 교체되는 인상을 없애고, 도시 배경 위에 여러 대시보드 패널이 하나의 시스템처럼 떠 있는 공간형 연출로 교체한다.
**아키텍처:** 공통 시간축과 도메인별 호스트 화면은 그대로 유지한다. `city-scene.js`의 비호스트 상세 레이어만 화면별 2패널 컴포지션으로 바꾸고, 현재 프레임의 `detailOpacity`, `detailScale`, `detailBlur` 값을 패널 그룹의 등장·퇴장에 재사용한다.
**대상 파일:** `src/screens/shared/city-scene.js`, `src/screens/shared/base.css`

## 전역 제약

- LEFT·CENTER·RIGHT는 기존 공통 시간축을 그대로 사용한다.
- 장면별 travel/hold 값과 전체 루프 길이는 변경하지 않는다.
- 각 출력 창은 자기 화면만 렌더링한다.
- 외부 CDN, 원격 폰트, 원격 API를 추가하지 않는다.
- 기존 `public/assets/images/demo/` 캡처 자산만 사용한다.

---

### Task 1: 비호스트 상세 패널을 공간형 컴포지션으로 교체

**Files:**
- Modify: `src/screens/shared/city-scene.js`

**Interfaces:**
- Consumes: 기존 `DEMO_MANIFEST`, `computeValues()`의 `demoOpacity`, `demoScale`, `demoBlurPx`
- Produces: 화면별 고정 2패널 컴포지션과 도메인 메타데이터 표시

- [x] **Step 1: 단일 `demoFrame`/`demoImg`를 메인 패널과 보조 패널을 포함하는 `demoScene`으로 교체한다.**
- [x] **Step 2: 시간 기반 이미지 인덱스 계산을 제거하고 매니페스트 순서대로 이미지를 두 패널에 고정 배치한다.**
- [x] **Step 3: 도메인명, 기능 설명, 상태 표시를 추가하되 고객사·지역명은 새로 만들지 않는다.**
- [x] **Step 4: 기존 등장·퇴장 값으로 전체 그룹의 opacity/scale/blur를 제어한다.**

### Task 2: 전시 화면용 깊이감과 미세 모션 추가

**Files:**
- Modify: `src/screens/shared/base.css`
- Modify: `src/screens/shared/city-scene.js`

**Interfaces:**
- Consumes: Task 1의 `demoScene` 하위 클래스
- Produces: 글래스 프레임, 패널 광택, 연결선, 부유 모션

- [x] **Step 1: 반투명 프레임·내부 테두리·그림자·광택 레이어 스타일을 추가한다.**
- [x] **Step 2: 화면별 좌우 구도를 미세하게 달리해 세 화면이 반복 복제처럼 보이지 않게 한다.**
- [x] **Step 3: `prefers-reduced-motion`에서 부유 모션을 끈다.**

### Task 3: 세 화면 동시 검증

**Files:**
- Verify: `src/screens/left/index.html`
- Verify: `src/screens/center/index.html`
- Verify: `src/screens/right/index.html`

- [x] **Step 1: 로컬 정적 서버를 실행하고 LEFT·CENTER·RIGHT를 동시에 연다.**
- [x] **Step 2: HC, SF, INF, RB, RD 각 체크포인트에서 호스트 이미지와 비호스트 패널 구성을 캡처로 확인한다.**
- [x] **Step 3: 브라우저 콘솔 오류, 이미지 404, 화면 경계 잘림이 없는지 확인한다.**
- [x] **Step 4: A02 이후 장면과 전체 타임라인이 기존 값으로 이어지는지 확인한다.**
