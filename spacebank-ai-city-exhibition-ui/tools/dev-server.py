"""
로컬 개발용 정적 서버 — python -m http.server와 똑같이 동작하지만,
모든 응답에 캐시 금지 헤더를 붙인다.

왜 필요한가: 작업 중 계속 브라우저가 수정 전 JS/HTML을 캐시에서 그대로 보여주는
문제가 반복됐다(강제 새로고침도 안 먹힌 적이 있음). 전시 최종 오프라인 빌드와는
무관한, 순수 로컬 확인용 서버에만 적용되는 설정이다.

사용법: python tools/dev-server.py [포트]  (기본 4173)
"""
import http.server
import sys

port = int(sys.argv[1]) if len(sys.argv) > 1 else 4173


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()


if __name__ == '__main__':
    http.server.test(HandlerClass=NoCacheHandler, port=port)
