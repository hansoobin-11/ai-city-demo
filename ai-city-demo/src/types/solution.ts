export type SolutionId =
  | "humanCare"
  | "safety"
  | "infrastructure"
  | "robotics"
  | "smartRoad";

export type SolutionStatusLabel =
  | "상용 솔루션"
  | "현장 적용 사례"
  | "데모 가능"
  | "맞춤형 구축";

export interface SolutionFeature {
  title: string;
  body: string;
}

export interface SolutionPreviewImage {
  src: string;
  /** 스와이퍼 상단에 "○○ 화면 예시"로 표시되는 짧은 이름(예: "대시보드"). */
  label: string;
}

export interface SolutionContent {
  id: SolutionId;
  number: string;
  zoneName: string;
  productName: string;
  statusLabel: SolutionStatusLabel;
  /** 도시 화면 카드와 상세 화면 상단에 쓰는 한 줄 요약. */
  eyebrow: string;
  headline: string;
  description: string;
  /** 상세 화면 3단 피처. 게이트 3에서 사용한다. */
  features: [SolutionFeature, SolutionFeature, SolutionFeature];
  imageSrc?: string;
  /** 화면 캡처 미리보기. 있으면 상세 화면 미디어 박스에 항상 보이는 스와이퍼로 표시된다. */
  images?: SolutionPreviewImage[];
  /** 소개 자료(PPT 캡처 등). 있으면 "소개 자료 보기" 버튼이 뜨고, 누르면 전체화면 모달에서 본다. */
  introSlides?: string[];
  videoSrc?: string;
  demoUrl?: string;
}
