document.addEventListener('DOMContentLoaded', function() {
    // 1. 모든 필수 HTML 요소 가져오기 (변수명을 통일하여 충돌 방지)
    const dept1Select = document.getElementById('dept1');
    const dept2Select = document.getElementById('dept2');
    const dept1Label = document.getElementById('dept1-reason-label');
    const dept2Label = document.getElementById('dept2-reason-label');

    // 요소가 로드되지 않았을 경우를 대비한 안전 장치
    if (!dept1Select || !dept2Select || !dept1Label || !dept2Label) {
        console.error("필요한 HTML 요소가 문서에서 발견되지 않았습니다. ID를 확인해주세요.");
        return; 
    }

    // A. 라벨 텍스트를 업데이트하는 함수
    function updateLabel(selectElement, labelElement, deptNum) { 
        // 선택된 <option> 요소의 텍스트를 가져옴
        const selectedOptionText = selectElement.options[selectElement.selectedIndex].text;
        
        let newLabelText = '';

        // 부서를 선택하지 않은 초기 상태이거나 값이 비어있을 때 (selectElement.value === "")
        if (selectElement.value === '') { 
             // deptNum 값(1 또는 2)에 따라 기본 텍스트 설정
             newLabelText = `제${deptNum}지망 부서를 지원한 이유*`;
        } else {
            // 선택된 부서 이름으로 라벨 텍스트 생성
            newLabelText = `${selectedOptionText}를 지원한 이유*`;
        }

        labelElement.textContent = newLabelText;
    }

    // B. 부서 중복 관리 및 라벨 업데이트를 모두 처리하는 메인 함수
    function handleDeptChange() {
        const selected1 = dept1Select.value;
        const selected2 = dept2Select.value;

        // 1. 중복 선택 방지 로직 실행
        // 모든 옵션 보이도록 초기화
        [...dept1Select.options].forEach(opt => opt.hidden = false);
        [...dept2Select.options].forEach(opt => opt.hidden = false);

        // 1번 값에 따라 2번 옵션 숨기기
        if (selected1) {
            [...dept2Select.options].forEach(opt => {
                if (opt.value !== "" && opt.value === selected1) {
                    opt.hidden = true;
                    if (opt.selected) { dept2Select.value = ""; } // 선택 초기화
                }
            });
        }

        // 2번 값에 따라 1번 옵션 숨기기
        if (selected2) {
            [...dept1Select.options].forEach(opt => {
                if (opt.value !== "" && opt.value === selected2) {
                    opt.hidden = true;
                    if (opt.selected) { dept1Select.value = ""; } // 선택 초기화
                }
            });
        }
        
        // 2. 라벨 업데이트 로직 실행
        updateLabel(dept1Select, dept1Label, 1);
        updateLabel(dept2Select, dept2Label, 2);
    }

    // 3. 이벤트 리스너 연결: 두 Select Box 모두 메인 함수 호출
    dept1Select.addEventListener('change', handleDeptChange);
    dept2Select.addEventListener('change', handleDeptChange);

    // 4. 페이지 로드 시 초기값 설정 및 중복 확인을 위해 한 번 실행
    handleDeptChange();
});

//* 끝 *//

