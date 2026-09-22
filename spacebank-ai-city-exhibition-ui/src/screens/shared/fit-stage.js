/**
 * 1920x1080 화면을 브라우저 창 크기에 맞춰 등비 축소만 한다.
 * 실제 전시 모니터는 1920x1080 그대로 배치되므로, 이 스케일링은 로컬 개발
 * 창에서 잘리지 않고 확인하기 위한 용도일 뿐 최종 출력 로직이 아니다.
 */
(function () {
  'use strict';
  function fit() {
    var stage = document.getElementById('stage-scale');
    if (!stage) return;
    var s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080, 1);
    stage.style.transform = 'scale(' + s + ')';
  }
  window.addEventListener('resize', fit);
  document.addEventListener('DOMContentLoaded', fit);
  fit();
})();
