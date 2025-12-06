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

const fileInput = document.getElementById("fileInput");
const fileDropdown = document.getElementById("fileDropdown");

fileInput.addEventListener("change", () => {
    if (fileInput.files.length > 0) {
        fileDropdown.childNodes[0].textContent = fileInput.files[0].name;
        fileDropdown.style.color = "var(--white)";
    } else {
        fileDropdown.childNodes[0].textContent = "파일을 선택해주세요.";
        fileDropdown.style.color = "var(--text-muted)";
    }
});

//* 끝 *//


/* ====================================
** 폼 제출 완료 메시지 표시 기능 추가 **
** (ID: recruitment-form, name 기준) **
==================================== */

document.addEventListener('DOMContentLoaded', function() {
    // A. 제출 완료 후 메시지를 표시하는 함수
    function showCompletionMessage(applicantName) {
        // 1. 지원 완료 컨테이너 생성 및 스타일링 (기존 폼 스타일 재사용)
        const completionContainer = document.createElement('div');
        completionContainer.className = 'apply-container'; 
        completionContainer.style.textAlign = 'center';
        completionContainer.style.padding = '100px 20px';
        completionContainer.style.marginTop = '80px';
        completionContainer.style.marginBottom = '80px';
        completionContainer.style.backgroundColor = 'var(--surface)'; 
        completionContainer.style.maxWidth = '1000px'; 
        completionContainer.style.boxShadow = 'var(--shadow-card)'; 

        // 2. 제목 (Title)
        const title = document.createElement('h3');
        title.className = 'apply-after-title';
        title.textContent = `${applicantName}님의 지원이 완료되었습니다.`;
        title.style.fontSize = '2.5em';
        title.style.marginBottom = '30px';

        // 3. 부제 (Subtext)
        const subtext = document.createElement('p');
        subtext.style.fontSize = '1.2em';
        subtext.style.lineHeight = '1.6';
        subtext.style.color = 'var(--text)';
        subtext.style.marginBottom = '50px';
        subtext.innerHTML = `
            인공지능공학부 학생회 MAIN()에 지원해 주셔서 감사합니다.<br>
        `;

        // 4. 돌아가기 버튼 (Button)
        const backButton = document.createElement('a');
        backButton.href = '/pages/8_tomato_recruit.html'; // 요청하신 링크
        backButton.className = 'submit-button'; 
        backButton.textContent = '뒤로가기';
        backButton.style.marginTop = '0';
        backButton.style.maxWidth = '300px';
        backButton.style.margin = '0 auto';
        backButton.style.textDecoration = 'none';

        // 5. 요소들을 컨테이너에 추가
        completionContainer.appendChild(title);
        completionContainer.appendChild(subtext);
        completionContainer.appendChild(backButton);

        // 6. 기존 폼 섹션을 대체
        const applyContainer = document.querySelector('.apply-container');
        const formSection = document.querySelector('.form-section'); 
        
        if (applyContainer && formSection) {
            applyContainer.style.display = 'none'; // 기존 폼 컨테이너 숨기기
            
            // apply-container 대신 새로운 완료 컨테이너를 부모 섹션에 추가
            formSection.appendChild(completionContainer);
            window.scrollTo(0, 0); // 스크롤 맨 위로 이동
        } else {
             // Fallback
             document.body.innerHTML = '';
             document.body.appendChild(completionContainer);
             window.scrollTo(0, 0);
        }
    }

    // B. 폼 제출 이벤트 리스너 연결
    // 폼 ID: recruitment-form, 이름 입력 필드 ID: name
    const form = document.getElementById('recruitment-form'); 
    const nameInput = document.getElementById('name'); 

    if (form && nameInput) {
        form.addEventListener('submit', function(event) {
            event.preventDefault(); // 폼의 기본 제출 동작(페이지 이동) 방지

            // 이름 값 가져오기
            const name = nameInput.value.trim();

            // 이름 필드 유효성 검사 (필수 입력 항목 가정)
            if (name === '') {
                alert('이름을 입력해주세요.'); 
                nameInput.focus();
                return;
            }
            // 완료 메시지 표시 함수 호출
            showCompletionMessage(name);
        });
    } else {
        console.error("필수 HTML 요소 (폼 ID: recruitment-form 또는 이름 ID: name)가 문서에 존재하지 않아 제출 기능을 연결할 수 없습니다.");
    }
});

