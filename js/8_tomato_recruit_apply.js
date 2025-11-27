const dept1 = document.getElementById('dept1');
const dept2 = document.getElementById('dept2');

function updateDropdowns() {
    const selected1 = dept1.value;
    const selected2 = dept2.value;

    // 모든 옵션 보이도록 초기화
    [...dept1.options].forEach(opt => opt.hidden = false);
    [...dept2.options].forEach(opt => opt.hidden = false);

    // 1번에서 고른 것 → 2번에서 숨기기
    if (selected1) {
        [...dept2.options].forEach(opt => {
            if (opt.value === selected1) opt.hidden = true;
        });
    }

    // 2번에서 고른 것 → 1번에서 숨기기
    if (selected2) {
        [...dept1.options].forEach(opt => {
            if (opt.value === selected2) opt.hidden = true;
        });
    }
}

dept1.addEventListener('change', updateDropdowns);
dept2.addEventListener('change', updateDropdowns);
