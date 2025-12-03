/**
 * 8_tomato_recruit.js
 * * [목록]
 * 1. 전역 변수 선언: map, marker 객체
 * 2. initKakaoMap(): 카카오맵 초기화 및 마커 표시
 * 3. 문서 로드 후 실행되는 일반 UI 스크립트:
 * - Rail & Scroll: 빠른 링크 레일 및 스크롤 버튼 동작
 */

// ===============================================
// I. 전역 변수 선언
// ===============================================
let map;
let marker;


// ===============================================
// II. 카카오맵 초기화 함수
// ===============================================

function initKakaoMap() {
    // 1. 지도의 중심 좌표 (숙명여자대학교 명신관) 설정
    // 위도(Latitude), 경도(Longitude) 순서입니다.
    const MYUNGSHIN_HALL_COORD = new kakao.maps.LatLng(37.5457038, 126.9636382);

    // 2. 지도를 띄울 DOM 요소 지정
    const mapContainer = document.getElementById("recruitMap");
    if (!mapContainer) {
        console.error("recruitMap ID를 가진 요소를 찾을 수 없습니다.");
        return;
    }
    
    // 지도 로드 전 플레이스홀더 텍스트 제거 및 배경 초기화 (CSS와 충돌 방지)
    mapContainer.innerHTML = ''; 
    mapContainer.style.backgroundColor = 'transparent'; 
    mapContainer.style.backgroundImage = 'none';

    // 3. 지도 옵션 설정
    const mapOptions = {
        center: MYUNGSHIN_HALL_COORD, // 지도 중심 좌표
        level: 3 // 확대 레벨 (숫자가 작을수록 확대)
    };

    // 맵 객체 생성 (전역 변수 map에 할당)
    map = new kakao.maps.Map(mapContainer, mapOptions);

    // 4. 마커 생성 및 지도에 표시 (전역 변수 marker에 할당)
    marker = new kakao.maps.Marker({
        position: MYUNGSHIN_HALL_COORD,
        map: map,
        title: "숙명여자대학교 명신관 505호"
    });

    // 5. 인포윈도우 (정보 창) 생성 및 마커에 연결
    const infoWindowContent = `
        <div style="padding:10px; font-size:14px; line-height:1.5; white-space: nowrap;">
            <b>숙명여자대학교 명신관 505호</b><br>
            면접 장소
        </div>
    `;

    const infoWindow = new kakao.maps.InfoWindow({
        content: infoWindowContent,
        removable: true
    });

    // 지도 로드 후 인포윈도우 열기
    infoWindow.open(map, marker);

    // 마커 클릭 리스너 추가: 클릭 시 정보 창 토글
    kakao.maps.event.addListener(marker, 'click', function() {
        if (infoWindow.getMap()) {
            infoWindow.close();
        } else {
            infoWindow.open(map, marker);
        }
    });

    // 6. 지도의 크기가 변경될 때 지도의 중심을 유지하기 위한 이벤트
    kakao.maps.event.addListener(map, 'resize', function() {
        map.setCenter(MYUNGSHIN_HALL_COORD);
    });
}


// ===============================================
// III. 문서 로드 후 실행되는 일반 UI 스크립트
// ===============================================

document.addEventListener('DOMContentLoaded', () => {
    
    // DOM 요소 캐싱
    const header = document.querySelector('.site-header');

    // -----------------------------------------------
    // 1. 카카오맵 SDK 로드 실행
    // -----------------------------------------------
    // DOMContentLoaded 이후에 카카오맵 SDK를 로드하고 initKakaoMap 함수를 실행합니다.
    if (typeof kakao !== 'undefined' && kakao.maps) {
        // autoload=false로 설정했으므로, 여기서 수동으로 로드해야 합니다.
        kakao.maps.load(function() {
            initKakaoMap();
        });
    }
    
    // 헤더/스크롤 스타일 변경 (스크롤 시)
    window.addEventListener('scroll', () => {
        const isScrolled = window.scrollY > 200;

        // 헤더 스타일 변경
        if (header) {
            if (isScrolled) {
                header.classList.add('is-scrolled');
            } else {
                header.classList.remove('is-scrolled');
            }
        }
    });
});
