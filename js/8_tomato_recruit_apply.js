document.addEventListener('DOMContentLoaded', function() {
    const dept1Select = document.getElementById('dept1');
    const dept2Select = document.getElementById('dept2');
    const dept1Label = document.getElementById('dept1-reason-label');
    const dept2Label = document.getElementById('dept2-reason-label');

    if (!dept1Select || !dept2Select || !dept1Label || !dept2Label) {
        console.error("필요한 HTML 요소가 문서에서 발견되지 않았습니다. ID를 확인해주세요.");
        return; 
    }

    function updateLabel(selectElement, labelElement, deptNum) { 
        const selectedOptionText = selectElement.options[selectElement.selectedIndex].text;
        
        let newLabelText = '';

        if (selectElement.value === '') { 
            newLabelText = `제${deptNum}지망 부서를 지원한 이유*`;
        } else {
            newLabelText = `${selectedOptionText}를 지원한 이유*`;
        }

        labelElement.textContent = newLabelText;
    }

    function handleDeptChange() {
        const selected1 = dept1Select.value;
        const selected2 = dept2Select.value;

        [...dept1Select.options].forEach(opt => opt.hidden = false);
        [...dept2Select.options].forEach(opt => opt.hidden = false);

        if (selected1) {
            [...dept2Select.options].forEach(opt => {
                if (opt.value !== "" && opt.value === selected1) {
                    opt.hidden = true;
                    if (opt.selected) { dept2Select.value = ""; }
                }
            });
        }

        if (selected2) {
            [...dept1Select.options].forEach(opt => {
                if (opt.value !== "" && opt.value === selected2) {
                    opt.hidden = true;
                    if (opt.selected) { dept1Select.value = ""; }
                }
            });
        }
        
        updateLabel(dept1Select, dept1Label, 1);
        updateLabel(dept2Select, dept2Label, 2);
    }

    dept1Select.addEventListener('change', handleDeptChange);
    dept2Select.addEventListener('change', handleDeptChange);

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


document.addEventListener('DOMContentLoaded', function() {
    function showCompletionMessage(applicantName) {
        const completionContainer = document.createElement('div');
        completionContainer.className = 'apply-container'; 
        completionContainer.style.textAlign = 'center';
        completionContainer.style.padding = '100px 20px';
        completionContainer.style.marginTop = '80px';
        completionContainer.style.marginBottom = '80px';
        completionContainer.style.backgroundColor = 'var(--surface)'; 
        completionContainer.style.maxWidth = '1000px'; 
        completionContainer.style.boxShadow = 'var(--shadow-card)'; 

        const title = document.createElement('h3');
        title.className = 'apply-after-title';
        title.textContent = `${applicantName}님의 지원이 완료되었습니다.`;
        title.style.fontSize = '2.5em';
        title.style.marginBottom = '30px';

        const subtext = document.createElement('p');
        subtext.style.fontSize = '1.2em';
        subtext.style.lineHeight = '1.6';
        subtext.style.color = 'var(--text)';
        subtext.style.marginBottom = '50px';
        subtext.innerHTML = `
            인공지능공학부 학생회 MAIN()에 지원해 주셔서 감사합니다.<br>
        `;

        const backButton = document.createElement('a');
        backButton.href = '/pages/8_tomato_recruit.html';
        backButton.className = 'submit-button'; 
        backButton.textContent = '뒤로가기';
        backButton.style.marginTop = '0';
        backButton.style.maxWidth = '300px';
        backButton.style.margin = '0 auto';
        backButton.style.textDecoration = 'none';

        completionContainer.appendChild(title);
        completionContainer.appendChild(subtext);
        completionContainer.appendChild(backButton);

        const applyContainer = document.querySelector('.apply-container');
        const formSection = document.querySelector('.form-section'); 
        
        if (applyContainer && formSection) {
            applyContainer.style.display = 'none';
            
            formSection.appendChild(completionContainer);
            window.scrollTo(0, 0);
        } else {
            document.body.innerHTML = '';
            document.body.appendChild(completionContainer);
            window.scrollTo(0, 0);
        }
    }

    const form = document.getElementById('recruitment-form'); 
    const nameInput = document.getElementById('name'); 

    if (form && nameInput) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();

            const name = nameInput.value.trim();

            if (name === '') {
                alert('이름을 입력해주세요.'); 
                nameInput.focus();
                return;
            }
            showCompletionMessage(name);
        });
    } else {
        console.error("필수 HTML 요소 (폼 ID: recruitment-form 또는 이름 ID: name)가 문서에 존재하지 않아 제출 기능을 연결할 수 없습니다.");
    }
});