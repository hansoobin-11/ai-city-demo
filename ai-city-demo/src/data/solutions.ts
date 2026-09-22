import type { SolutionContent, SolutionId } from "../types/solution";

/**
 * 콘텐츠 출처: `데모 시연 초안.html`의 `solutions` 정의 (원문 그대로 복사).
 * 자료에 없는 기능과 수치는 추측하지 않는다.
 */
export const solutions: Record<SolutionId, SolutionContent> = {
  humanCare: {
    id: "humanCare",
    number: "01",
    zoneName: "AI HUMAN CARE",
    productName: "AIoT Wright (HumanCare)",
    statusLabel: "상용 솔루션",
    eyebrow: "라이프스타일·바이탈 데이터 기반 휴먼케어 통합관제",
    headline: "접촉 없이 호흡·심박과 낙상 징후를 감지합니다",
    description:
      "비접촉 mmWave 레이더 센서가 호흡·심박 이상 상태와 재실 여부, 화장실 낙상을 감지하고 관리자에게 알림과 이력을 제공합니다.",
    features: [
      {
        title: "비접촉 바이탈 모니터링",
        body: "침상에서 호흡수와 심박수, 재실 여부를 실시간으로 확인합니다.",
      },
      {
        title: "낙상·이상 상태 감지",
        body: "넘어짐과 장기 사용, 설정 범위를 벗어난 바이탈 상태를 감지합니다.",
      },
      {
        title: "알림과 상태 이력",
        body: "대시보드 팝업과 음성 알림을 제공하고 기간별 상태 변화를 확인합니다.",
      },
    ],
    // 메인 미리보기 스와이퍼(미디어 박스, 항상 노출). 출처: 사용자 제공 화면 캡처
    // (낙상 센서 / 대시보드 / 수면 보고서 / 호흡심박 센서).
    images: [
      { src: "/assets/humancare/images/1.png", label: "낙상 센서" },
      { src: "/assets/humancare/images/2.png", label: "대시보드" },
      { src: "/assets/humancare/images/3.png", label: "수면 보고서" },
      { src: "/assets/humancare/images/4.png", label: "호흡심박 센서" },
    ],
    // "소개 자료 보기" 버튼 → 모달. 출처: 사용자 제공 소개 자료 14장.
    introSlides: [
      "/assets/humancare/introduction/01.png",
      "/assets/humancare/introduction/02.png",
      "/assets/humancare/introduction/03.png",
      "/assets/humancare/introduction/04.png",
      "/assets/humancare/introduction/05.png",
      "/assets/humancare/introduction/06.png",
      "/assets/humancare/introduction/07.png",
      "/assets/humancare/introduction/08.png",
      "/assets/humancare/introduction/09.png",
      "/assets/humancare/introduction/10.png",
      "/assets/humancare/introduction/11.png",
      "/assets/humancare/introduction/12.png",
      "/assets/humancare/introduction/13.png",
      "/assets/humancare/introduction/14.png",
    ],
    // "데모 보기" 버튼 → 새 탭. 출처: 사용자 제공.
    demoUrl:
      "https://gb9fb258fe17506-apexdb.adb.ap-seoul-1.oraclecloudapps.com/ords/r/iot_humancare1_3_0/aiot131",
  },
  safety: {
    id: "safety",
    number: "02",
    zoneName: "AI SAFETY",
    productName: "SPIDER Wright",
    statusLabel: "맞춤형 구축",
    eyebrow: "재난·환경 데이터 기반 도시 안전 통합관제",
    headline: "재난·기상·시설 데이터를 함께 분석해 먼저 확인해야 할 위험을 찾습니다",
    description:
      "재난과 기상 정보, 시설 위치와 상태 데이터를 한 화면에 연결해 영향권 시설을 확인하고 관리자에게 알림과 대응 정보를 제공합니다.",
    features: [
      {
        title: "재난·기상 데이터 연계",
        body: "호우, 폭염, 지진 등 외부 정보를 시설 데이터와 함께 확인합니다.",
      },
      {
        title: "영향권 시설 확인",
        body: "시설 위치와 재해 범위를 비교해 우선 확인할 대상을 찾습니다.",
      },
      {
        title: "대응 안내와 이력 관리",
        body: "상황별 안내를 제공하고 알림과 조치 이력을 관리합니다.",
      },
    ],
    // 메인 미리보기 스와이퍼(미디어 박스, 항상 노출). 출처: 사용자 제공 화면 캡처
    // (대시보드 / 재난통계 / 재해 시뮬레이션 / 폭염정보).
    images: [
      { src: "/assets/safety/images/1.png", label: "대시보드" },
      { src: "/assets/safety/images/2.png", label: "재난통계" },
      { src: "/assets/safety/images/3.png", label: "재해 시뮬레이션" },
      { src: "/assets/safety/images/4.png", label: "폭염정보" },
    ],
    // "소개 자료 보기" 버튼 → 모달. 출처: 사용자 제공 소개 자료 10장.
    introSlides: [
      "/assets/safety/introduction/01.png",
      "/assets/safety/introduction/02.png",
      "/assets/safety/introduction/03.png",
      "/assets/safety/introduction/04.png",
      "/assets/safety/introduction/05.png",
      "/assets/safety/introduction/06.png",
      "/assets/safety/introduction/07.png",
      "/assets/safety/introduction/08.png",
      "/assets/safety/introduction/09.png",
      "/assets/safety/introduction/10.png",
    ],
  },
  infrastructure: {
    id: "infrastructure",
    number: "03",
    zoneName: "AI INFRASTRUCTURE",
    productName: "Gene Bank 지능형 관제",
    statusLabel: "현장 적용 사례",
    eyebrow: "유전자원 및 국가·도시 핵심시설 지능형 관제",
    headline: "핵심시설의 환경과 설비 상태를 분석해 이상 징후를 조기에 알립니다",
    description:
      "온도와 습도 등 시설 데이터를 실시간으로 수집하고, 이상 패턴을 탐지해 중요한 자원과 시설의 안정적인 운영을 지원합니다.",
    features: [
      {
        title: "시설 데이터 실시간 수집",
        body: "공간별 센서와 설비 상태를 한 화면에서 확인합니다.",
      },
      {
        title: "AI 이상 패턴 탐지",
        body: "축적된 시계열 데이터를 분석해 평소와 다른 변화를 감지합니다.",
      },
      {
        title: "관제·알람·제어",
        body: "이상 상태를 알리고 이력을 관리하며 필요한 설비 제어를 지원합니다.",
      },
    ],
    // 메인 미리보기 스와이퍼(미디어 박스, 항상 노출). 출처: 사용자 제공 화면 캡처
    // (AI 패턴 탐지 / 대시보드 / 알림기록 / 차트분석).
    images: [
      { src: "/assets/infrastructure/images/1.png", label: "AI 패턴 탐지" },
      { src: "/assets/infrastructure/images/2.png", label: "대시보드" },
      { src: "/assets/infrastructure/images/3.png", label: "알림기록" },
      { src: "/assets/infrastructure/images/4.png", label: "차트분석" },
    ],
    // "소개 자료 보기" 버튼 → 모달. 출처: 사용자 제공 소개 자료 6장.
    introSlides: [
      "/assets/infrastructure/introduction/01.png",
      "/assets/infrastructure/introduction/02.png",
      "/assets/infrastructure/introduction/03.png",
      "/assets/infrastructure/introduction/04.png",
      "/assets/infrastructure/introduction/05.png",
      "/assets/infrastructure/introduction/06.png",
    ],
    // "홍보 영상 보기" 버튼 → 모달. 출처: 유전자원_demo.mp4(사용자 제공).
    videoSrc: "/assets/infrastructure/video/video.mp4",
  },
  robotics: {
    id: "robotics",
    number: "04",
    zoneName: "AI ROBOTICS",
    productName: "RoboViewX",
    statusLabel: "데모 가능",
    eyebrow: "로봇·드론 등 이기종 Physical AI 통합관제",
    headline: "서로 다른 로봇의 위치·영상·임무와 상태를 하나의 화면에서 운영합니다",
    description:
      "순찰 로봇의 위치와 실시간 영상, 작업 일정과 상태를 통합해 실외 시설의 순찰과 점검을 지원합니다.",
    features: [
      {
        title: "자율 순찰과 스케줄",
        body: "등록된 경로와 일정에 따라 로봇의 순찰 작업을 운영합니다.",
      },
      {
        title: "위치·영상 통합관제",
        body: "로봇의 위치와 이동 경로, 실시간 영상을 한 화면에서 확인합니다.",
      },
      {
        title: "상태·이벤트 모니터링",
        body: "배터리와 장치 상태, 침입 감지 이벤트와 기록을 확인합니다.",
      },
    ],
    // 메인 미리보기 스와이퍼(미디어 박스, 항상 노출). 출처: RoboViewX 실제 화면
    // 캡처(사용자 제공). 통합 관제 대시보드 / 웨이포인트 등록 / 경로 편집 / 스케줄링.
    images: [
      { src: "/assets/robotics/images/1.png", label: "통합 관제 대시보드" },
      { src: "/assets/robotics/images/2.png", label: "웨이포인트 등록" },
      { src: "/assets/robotics/images/3.png", label: "경로 편집" },
      { src: "/assets/robotics/images/4.png", label: "스케줄링" },
    ],
    // "소개 자료 보기" 버튼 → 모달. 출처: RoboViewX 소개 PPT.pdf 18장 중 12장.
    // 통신 설계·GNSS/SLAM 등 엔지니어링 상세(04 ARCHITECTURE, 05 TECHNOLOGY
    // 일부)는 관람객 대상이 아니라서 제외.
    introSlides: [
      "/assets/robotics/introduction/01.png",
      "/assets/robotics/introduction/02.png",
      "/assets/robotics/introduction/03.png",
      "/assets/robotics/introduction/04.png",
      "/assets/robotics/introduction/05.png",
      "/assets/robotics/introduction/06.png",
      "/assets/robotics/introduction/07.png",
      "/assets/robotics/introduction/08.png",
      "/assets/robotics/introduction/09.png",
      "/assets/robotics/introduction/10.png",
      "/assets/robotics/introduction/11.png",
      "/assets/robotics/introduction/12.png",
    ],
    // "홍보 영상 보기" 버튼 → 모달. 출처: RoboViewX_v2.mp4(사용자 제공, 솔루션
    // 소개 자료 원본과 동일 파일, 70MB — 로컬 서빙이라 압축하지 않음.
    videoSrc: "/assets/robotics/video/RoboViewX.mp4",
    // "데모 보기" 버튼 → 새 탭. 출처: 사용자 제공.
    demoUrl: "https://roboviewx.raiid.ai/",
  },
  smartRoad: {
    id: "smartRoad",
    number: "05",
    zoneName: "AI SMART ROAD",
    productName: "도로 열선 통합관제",
    statusLabel: "맞춤형 구축",
    eyebrow: "도로 열선·기상·노면 데이터 기반 지능형 통합관제",
    headline: "기상과 도로 상태를 바탕으로 결빙 위험을 확인하고 열선을 통합 제어합니다",
    description:
      "여러 업체의 도로 열선 상태를 한 화면에서 확인하고, 기상 상황에 따라 구간별 열선을 제어해 겨울철 도로 운영을 지원합니다.",
    features: [
      {
        title: "열선 상태 통합관제",
        body: "분산된 열선의 작동 상태와 이상 여부를 한 화면에서 확인합니다.",
      },
      {
        title: "전체·구간별 제어",
        body: "전체 구간 또는 행정구역 단위로 열선을 제어합니다.",
      },
      {
        title: "기상 예보 알림",
        body: "눈 예보와 기상 변화를 확인해 사전 대응을 지원합니다.",
      },
    ],
    // 메인 미리보기 스와이퍼(미디어 박스, 항상 노출). 출처: 사용자 제공 화면 캡처
    // (대시보드 1 / 대시보드 2).
    images: [
      { src: "/assets/smart-road/images/1.png", label: "대시보드" },
      { src: "/assets/smart-road/images/2.png", label: "대시보드" },
    ],
    // "소개 자료 보기" 버튼 → 모달. 출처: 사용자 제공 소개 자료 7장.
    introSlides: [
      "/assets/smart-road/introduction/01.png",
      "/assets/smart-road/introduction/02.png",
      "/assets/smart-road/introduction/03.png",
      "/assets/smart-road/introduction/04.png",
      "/assets/smart-road/introduction/05.png",
      "/assets/smart-road/introduction/06.png",
      "/assets/smart-road/introduction/07.png",
    ],
  },
};

/** 도시 화면 핀 순서 및 상세 화면 이전/다음 이동 순서. */
export const zoneOrder: SolutionId[] = [
  "humanCare",
  "safety",
  "infrastructure",
  "robotics",
  "smartRoad",
];
