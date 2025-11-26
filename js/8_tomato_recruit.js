/**
 * 8_tomato_recruit.js
 * * [목록]
 * 1. 전역 변수 선언: map, marker 객체
 * 2. initNaverMap(): 네이버 지도 초기화 및 마커 표시
 * 3. 문서 로드 후 실행되는 일반 UI 스크립트:
 * - Theme Toggler: 다크/라이트 모드 전환
 * - Rail & Scroll: 빠른 링크 레일 및 스크롤 버튼 동작
 */

// ===============================================
// I. 전역 변수 선언
// ===============================================
// 지도 객체를 다른 함수에서도 접근할 수 있도록 전역 변수로 선언합니다.
let map;
let marker;


// ===============================================
// II. 네이버 지도 초기화 함수 (API 콜백)
// ===============================================

function initNaverMap() {
    // 1. 지도의 중심 좌표 (숙명여자대학교 명신관) 설정
    const MYUNGSHIN_HALL_COORD = new naver.maps.LatLng(37.5457038, 126.9636382);

    // 2. 지도 옵션 설정
    const mapOptions = {
        center: MYUNGSHIN_HALL_COORD,
        zoom: 17, // 확대 레벨
        minZoom: 10,
        zoomControl: true,
        zoomControlOptions: {
            position: naver.maps.Position.TOP_RIGHT
        }
    };

    // 3. 지도를 DOM 요소에 렌더링
    const mapDiv = document.getElementById("recruitMap");
    if (!mapDiv) {
        console.error("recruitMap ID를 가진 요소를 찾을 수 없습니다.");
        return;
    }

    // 지도 로드 전 플레이스홀더 텍스트 제거 및 배경 초기화 (크기 오류 방지)
    mapDiv.innerHTML = ''; 
    mapDiv.style.backgroundColor = 'transparent'; 
    mapDiv.style.backgroundImage = 'none';

    // 맵 객체 생성 (전역 변수 map에 할당)
    map = new naver.maps.Map('recruitMap', mapOptions);

    // 4. 마커 생성 및 지도에 표시 (전역 변수 marker에 할당)
    marker = new naver.maps.Marker({
        position: MYUNGSHIN_HALL_COORD,
        map: map,
        title: "면접 장소: 숙명여자대학교 명신관 505호",
        icon: {
            url: 'https://navermaps.github.io/maps.js.ncp/docs/img/example/pin_default.png',
            size: new naver.maps.Size(24, 38),
            anchor: new naver.maps.Point(12, 38)
        }
    });

    // 5. 정보 창 (InfoWindow) 생성 및 마커에 연결
    const infoWindow = new naver.maps.InfoWindow({
        content: `
            <div style="padding:10px; font-size:14px; line-height:1.5;">
                <b>숙명여자대학교 명신관 505호</b><br>
                면접 장소
            </div>
        `,
        maxWidth: 200,
        disableAutoPan: true
    });

    // 지도 로드 후 정보창 열기
    infoWindow.open(map, marker); 

    // 마커 클릭 리스너 추가: 클릭 시 정보창 토글
    naver.maps.Event.addListener(marker, 'click', function() {
        if (infoWindow.getMap()) {
            infoWindow.close();
        } else {
            infoWindow.open(map, marker);
        }
    });
}


// ===============================================
// III. 문서 로드 후 실행되는 일반 UI 스크립트
// ===============================================

document.addEventListener('DOMContentLoaded', () => {
    
    // DOM 요소 캐싱 (전역 변수를 선언한 후 사용하는 것이 효율적)
    const themeSwitch = document.getElementById('themeSwitch');
    const html = document.documentElement;
    const rail = document.querySelector('.rail');
    const railTrigger = document.querySelector('.rail-trigger');
    const railCollapse = document.querySelector('.rail-collapse');
    const railScroll = document.querySelector('.rail-scroll');
    const railFab = document.querySelector('.rail-fab');
    const header = document.querySelector('.site-header');


    // -----------------------------------------------
    // 1. 테마 토글러 (Theme Toggler)
    // -----------------------------------------------
    // 초기 테마 설정
    const savedTheme = localStorage.getItem('theme') || 'dark'; 
    html.setAttribute('data-theme', savedTheme);
    if (themeSwitch) {
        themeSwitch.checked = savedTheme === 'dark';
    }

    // 테마 변경 이벤트 리스너
    if (themeSwitch) {
        themeSwitch.addEventListener('change', () => {
            if (themeSwitch.checked) {
                html.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
            } else {
                html.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
            }
            
            // 로고 이미지 경로 업데이트
            document.querySelectorAll('.nav__logo').forEach(logo => {
                const isDark = html.getAttribute('data-theme') === 'dark';
                logo.src = isDark ? logo.getAttribute('data-logo-dark') : logo.getAttribute('data-logo-light');
            });
            
            // 🚨 지도가 로드된 후 테마가 변경되면 지도 크기/스타일을 재조정할 수 있음
            if (typeof naver !== 'undefined' && naver.maps && map) {
                // map.refresh()는 지도가 숨겨졌다 나타날 때 크기를 재조정하는 용도로 주로 사용됨
                // map.refresh(); 
                
                // 지도 스타일 변경 로직 (네이버 커스텀 스타일 사용 시)
                // map.setOptions({ mapType: naver.maps.MapTypeId.NORMAL }); // 예시
            }
        });
    }

    // 초기 로고 이미지 설정 (DOMContentLoaded 시점에 한 번 실행)
    const initialTheme = html.getAttribute('data-theme');
    document.querySelectorAll('.nav__logo').forEach(logo => {
        const isDark = initialTheme === 'dark';
        logo.src = isDark ? logo.getAttribute('data-logo-dark') : logo.getAttribute('data-logo-light');
    });


    // -----------------------------------------------
    // 2. 플로팅 레일 및 스크롤 동작 (Rail & Scroll)
    // -----------------------------------------------
    
    // 레일 토글 기능
    if (railTrigger && rail) {
        railTrigger.addEventListener('click', () => {
            const isExpanded = railTrigger.getAttribute('aria-expanded') === 'true';
            railTrigger.setAttribute('aria-expanded', !isExpanded);
            rail.classList.toggle('is-open');
        });
    }
    if (railCollapse && rail) {
        railCollapse.addEventListener('click', () => {
            rail.classList.remove('is-open');
            if (railTrigger) {
                railTrigger.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // 맨 위로 스크롤 기능
    if (railScroll) {
        railScroll.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // 헤더/스크롤 스타일 변경 (스크롤 시)
    window.addEventListener('scroll', () => {
        // 스크롤 버튼 표시/숨김
        if (window.scrollY > 200) {
            if (railFab) railFab.classList.add('is-visible');
            if (header) header.classList.add('is-scrolled');
        } else {
            if (railFab) railFab.classList.remove('is-visible');
            if (header) header.classList.remove('is-scrolled');
        }
    });
});