let map;
let marker;

function initKakaoMap() {
    const MYUNGSHIN_HALL_COORD = new kakao.maps.LatLng(37.5457038, 126.9636382);

    const mapContainer = document.getElementById("recruitMap");
    if (!mapContainer) {
        console.error("recruitMap ID를 가진 요소를 찾을 수 없습니다.");
        return;
    }
    
    mapContainer.innerHTML = ''; 
    mapContainer.style.backgroundColor = 'transparent'; 
    mapContainer.style.backgroundImage = 'none';

    const mapOptions = {
        center: MYUNGSHIN_HALL_COORD,
        level: 3
    };

    map = new kakao.maps.Map(mapContainer, mapOptions);

    marker = new kakao.maps.Marker({
        position: MYUNGSHIN_HALL_COORD,
        map: map,
        title: "숙명여자대학교 명신관 505호"
    });

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

    infoWindow.open(map, marker);

    kakao.maps.event.addListener(marker, 'click', function() {
        if (infoWindow.getMap()) {
            infoWindow.close();
        } else {
            infoWindow.open(map, marker);
        }
    });

    kakao.maps.event.addListener(map, 'resize', function() {
        map.setCenter(MYUNGSHIN_HALL_COORD);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    
    const header = document.querySelector('.site-header');

    if (typeof kakao !== 'undefined' && kakao.maps) {
        kakao.maps.load(function() {
            initKakaoMap();
        });
    }
    
    window.addEventListener('scroll', () => {
        const isScrolled = window.scrollY > 200;

        if (header) {
            if (isScrolled) {
                header.classList.add('is-scrolled');
            } else {
                header.classList.remove('is-scrolled');
            }
        }
    });
});
