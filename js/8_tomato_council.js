const GIF_DURATION_MS = 3200;

document.addEventListener('DOMContentLoaded', () => {
    const risingTextElement = document.querySelector('.rising-text');
    
    risingTextElement.classList.add('gif-playing');

    setTimeout(() => {
        
        risingTextElement.classList.remove('gif-playing');
        
        risingTextElement.classList.add('static-png');
        
    }, GIF_DURATION_MS);
});

document.addEventListener('DOMContentLoaded', () => {
    const lines = document.querySelectorAll('.council-intro-line.line-1, .council-intro-line.line-2');

    const wrapWords = (element) => {
        const html = element.innerHTML.trim();
        const cleanedHtml = html.replace(/<br\s*\/?>/gi, ' ');
        
        const words = cleanedHtml.match(/<[^>]+>|[\w가-힣()\-']+|[.,?!:;]|\s+/g);
        
        if (!words) return;

        let newHTML = '';
        words.forEach(word => {
            if (word.match(/^\s+$/) || word.startsWith('<')) {
                newHTML += word;
            } else {
                newHTML += `<span class="word-unit" data-word="${word}">${word}</span>`;
            }
        });
        element.innerHTML = newHTML;
    };

    lines.forEach(line => {
        wrapWords(line);
    });

    const allWords = document.querySelectorAll('.council-intro-section .line-1 .word-unit, .council-intro-section .line-2 .word-unit');
    
    const checkScrollProgress = () => {
        const viewportHeight = window.innerHeight;
        
        const totalWords = allWords.length;
        const segmentDuration = 1 / totalWords; 

        const startOffset = viewportHeight * 0.89;
        const endOffset = viewportHeight * 0.6;
        
        allWords.forEach((word, index) => { 
            const rect = word.getBoundingClientRect();
            
            let scrollProgress = 0;

            if (rect.top > startOffset) {
                scrollProgress = 0;
            } else if (rect.top < endOffset) {
                scrollProgress = 1;
            } else {
                const totalRange = startOffset - endOffset;
                const distanceScrolled = startOffset - rect.top;
                scrollProgress = distanceScrolled / totalRange;
            }
            
            const segmentStart = index * segmentDuration;
            const segmentEnd = (index + 1) * segmentDuration;
            
            let wordProgress = 0;
            if (scrollProgress < segmentStart) {
                wordProgress = 0;
            } else if (scrollProgress > segmentEnd) {
                wordProgress = 1;
            } else {
                wordProgress = (scrollProgress - segmentStart) / segmentDuration;
            }

            const fillPercentage = Math.min(1, Math.max(0, wordProgress));

            word.style.setProperty('--fill-width', `${fillPercentage * 100}%`);
        });
    };

    window.addEventListener('scroll', checkScrollProgress);
    window.addEventListener('resize', checkScrollProgress);
    
    checkScrollProgress();
});

const carousel = document.querySelector('.carousel-container');

if (carousel) {
    let isDown = false; 
    let startX;
    let scrollLeft;

    carousel.addEventListener('mousedown', (e) => {
        isDown = true;
        carousel.classList.add('active-dragging'); 
        
        startX = e.pageX - carousel.offsetLeft; 
        
        scrollLeft = carousel.scrollLeft;
    });

    const stopDragging = () => {
        isDown = false;
        carousel.classList.remove('active-dragging');
    };
    
    carousel.addEventListener('mouseleave', stopDragging);
    carousel.addEventListener('mouseup', stopDragging);
    
    carousel.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        
        const x = e.pageX - carousel.offsetLeft; 
        
        const walk = (x - startX) * 2;

        carousel.scrollLeft = scrollLeft - walk;
    });
}