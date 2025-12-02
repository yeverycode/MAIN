// 8_tomato_council.js 파일 전체 내용

document.addEventListener('DOMContentLoaded', () => {
    // 애니메이션을 적용할 .line-1과 .line-2만 선택합니다.
    const lines = document.querySelectorAll('.council-intro-line.line-1, .council-intro-line.line-2');

    // 1. 단어 분리 및 <span> 래핑 함수 (띄어쓰기는 래핑하지 않고 그대로 두도록 수정)
    const wrapWords = (element) => {
        const html = element.innerHTML.trim();
        const cleanedHtml = html.replace(/<br\s*\/?>/gi, ' ');
        
        // 정규식: HTML 태그, 단어, 구두점, 공백(`\s+`)을 모두 래핑 대상으로 지정
        const words = cleanedHtml.match(/<[^>]+>|[\w가-힣()\-']+|[.,?!:;]|\s+/g);
        
        if (!words) return;

        let newHTML = '';
        words.forEach(word => {
            // 💡 띄어쓰기(공백)나 HTML 태그는 래핑하지 않고 그대로 둠
            if (word.match(/^\s+$/) || word.startsWith('<')) {
                newHTML += word;
            } else {
                // 단어, 구두점만 .word-unit으로 래핑하고 data-word에 저장
                newHTML += `<span class="word-unit" data-word="${word}">${word}</span>`;
            }
        });
        element.innerHTML = newHTML;
    };

    // 페이지 로드 시 선택된 문단(line-1, line-2)의 단어를 래핑
    lines.forEach(line => {
        wrapWords(line);
    });

    // .line-1과 .line-2 내부의 단어들만 선택
    const allWords = document.querySelectorAll('.council-intro-section .line-1 .word-unit, .council-intro-section .line-2 .word-unit');
    
    // 2. 스크롤 비례 및 단어 순차 애니메이션 로직
    const checkScrollProgress = () => {
        const viewportHeight = window.innerHeight;
        
        const totalWords = allWords.length;
        // 각 단어가 전체 애니메이션 구간에서 차지하는 비율
        const segmentDuration = 1 / totalWords; 

        // 💡 수정: 스크롤 범위 (애니메이션이 끝까지 완료되는 지점을 화면 중앙 근처로 설정)
        const startOffset = viewportHeight * 0.8; // 화면 하단 90% 지점에서 시작 (이전과 동일)
        const endOffset = viewportHeight * 0.3;   // 화면 중앙 50% 지점에서 완료 (수정됨)
        
        allWords.forEach((word, index) => { 
            const rect = word.getBoundingClientRect();
            
            let scrollProgress = 0;

            if (rect.top > startOffset) {
                scrollProgress = 0;
            } else if (rect.top < endOffset) {
                scrollProgress = 1; // 화면 중앙을 지남 (완료)
            } else {
                const totalRange = startOffset - endOffset;
                const distanceScrolled = startOffset - rect.top;
                scrollProgress = distanceScrolled / totalRange;
            }
            
            // 💡 단어별 순차 진행률 계산 (이전과 동일)
            const segmentStart = index * segmentDuration;
            const segmentEnd = (index + 1) * segmentDuration;
            
            let wordProgress = 0;
            if (scrollProgress < segmentStart) {
                wordProgress = 0; // 아직 이전 단어가 덜 채워짐
            } else if (scrollProgress > segmentEnd) {
                wordProgress = 1; // 채우기 완료
            } else {
                // 현재 단어의 구간 내에서의 상대적 진행률 계산
                wordProgress = (scrollProgress - segmentStart) / segmentDuration;
            }

            const fillPercentage = Math.min(1, Math.max(0, wordProgress));

            // word-unit 요소에 커스텀 CSS 변수를 설정하여 CSS width를 제어
            word.style.setProperty('--fill-width', `${fillPercentage * 100}%`);
        });
    };

    // 스크롤 이벤트 리스너 등록
    window.addEventListener('scroll', checkScrollProgress);
    window.addEventListener('resize', checkScrollProgress);
    
    // 페이지 로드 시 한 번 실행
    checkScrollProgress();
});

const carousel = document.querySelector('.carousel-container');

if (carousel) {
    let isDown = false; 
    let startX;      
    let scrollLeft;     

    // 1. 마우스 누르기 (드래그 시작)
    carousel.addEventListener('mousedown', (e) => {
        isDown = true;
        // 드래그 중임을 시각적으로 표시하기 위해 클래스 추가 (CSS에서 cursor: grabbing; 적용)
        carousel.classList.add('active-dragging'); 
        
        // **startX**: 마우스가 눌린 위치 (컨테이너 내에서의 절대 위치)
        // e.pageX: 현재 마우스의 전체 페이지 기준 X 좌표
        // carousel.offsetLeft: 캐러셀 컨테이너가 페이지 좌측에서 떨어진 거리
        // => startX는 드래그 시작 시 마우스 커서의 컨테이너 내부 상대 위치를 저장합니다.
        startX = e.pageX - carousel.offsetLeft; 
        
        // **scrollLeft**: 마우스가 눌린 시점의 캐러셀 초기 스크롤 위치
        scrollLeft = carousel.scrollLeft;        
    });

    // 2. 마우스에서 손 떼기 및 벗어나기 (드래그 끝)
    const stopDragging = () => {
        isDown = false;
        carousel.classList.remove('active-dragging');
    };
    
    carousel.addEventListener('mouseleave', stopDragging);
    carousel.addEventListener('mouseup', stopDragging);
    

    // 3. 마우스 이동 (드래그 중)
    carousel.addEventListener('mousemove', (e) => {
        if (!isDown) return; // 마우스 버튼이 눌러지지 않았다면 아무것도 하지 않음
        e.preventDefault();  // 이미지 드래그 같은 기본 동작 방지
        
        // 현재 마우스 위치 (컨테이너 내부 상대 위치)
        const x = e.pageX - carousel.offsetLeft; 
        
        // **walk**: 드래그 시작점(startX)과 현재점(x) 사이의 거리 (이동량)
        // 양수면 오른쪽으로, 음수면 왼쪽으로 이동했음을 의미
        // * 2: 스크롤 속도를 2배로 높여 더 빨리 움직이게 만듭니다. (취향에 따라 조절)
        const walk = (x - startX) * 2;         

        // 최종 스크롤 위치 계산
        // scrollLeft (드래그 시작 시 초기 위치) - walk (이동량)
        // 마우스를 오른쪽으로 이동(walk가 양수)하면, 스크롤 위치는 감소하여 컨텐츠가 오른쪽으로 이동(왼쪽으로 스크롤)하는 효과를 냅니다.
        carousel.scrollLeft = scrollLeft - walk;
    });
}