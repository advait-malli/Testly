// Global variables
const kahootframe = document.getElementById('kahootframe');
const gformsframe = document.getElementById('gformsframe');
const body = document.body;
const moon = document.querySelector('.lucide-moon-icon');
const sun = document.querySelector('.lucide-sun-icon');
const root = document.documentElement;
const kahootlayout = document.getElementById('kahootlayout');
const gformslayout = document.getElementById('gformslayout');
const allSubButtons = [
    document.getElementById('phybutton'),
    document.getElementById('chebutton'),
    document.getElementById('biobutton'),
    document.getElementById('mathbutton'),
    document.getElementById('matbutton')
];

const subjectFiles = {
    'Physics': './subjects/s1.json',
    'Chemistry': './subjects/s2.json',
    'Biology': './subjects/s3.json',
    'Mathematics': './subjects/s4.json',
    'Mental Ability': './subjects/s5.json'
};

let subjectData = {};
let currentSubject = 'Physics';
let currentQuestionIndex = 1;
let userAnswers = {};
let isAuthenticated = false;

// Initialize subject buttons
allSubButtons[0].classList.add('primary', 'highlight');
for (let i = 1; i < allSubButtons.length; i++) {
    allSubButtons[i].classList.add('null', 'icon');
    const span = allSubButtons[i].querySelector('span');
    if (span) span.style.display = 'none';
}
kahootlayout.classList.add('primary');

// Theme initialization
if (body.classList.contains('dark')) {
    moon.style.display = 'inline';
    sun.style.display = 'none';
} else {
    moon.style.display = 'none';
    sun.style.display = 'inline';
}
kahootframe.style.display = 'block';
gformsframe.style.display = 'none';

// Load all subjects on page load
async function loadAllSubjects() {
    for (const [subject, file] of Object.entries(subjectFiles)) {
        try {
            const response = await fetch(file);
            subjectData[subject] = await response.json();
            
            // Initialize answers for this subject
            if (!userAnswers[subject]) {
                userAnswers[subject] = {};
            }
        } catch (error) {
            console.error(`Error loading ${subject}:`, error);
        }
    }
    displayCurrentQuestion();
}

// Theme toggle
function toggleTheme() {
    body.classList.toggle('dark');
    if (body.classList.contains('dark')) {
        moon.style.display = 'inline';
        sun.style.display = 'none';
        root.style.setProperty('--light-color', 'rgba(255, 255, 255, 0.094)');
        root.style.setProperty('--dark-color', 'rgba(255, 255, 255, 0.75)');
        root.style.setProperty('--light-bg', '#000');
        root.style.setProperty('--dark-bg', '#efeef5');
        root.style.setProperty('--light-text', '#fff');
        root.style.setProperty('--dark-text', '#000');
        moon.style.color = '#000';

        allSubButtons.forEach(button => {
            const svg = button.querySelector('svg');
            if (svg) {
                svg.style.stroke = button.classList.contains('primary') ? '#fff' : '#000';
            }
        });

        if (kahootlayout.classList.contains('primary')) {
            const gformslayouticon = document.getElementById('gformslayouticon');
            if (gformslayouticon) gformslayouticon.style.color = '#000';
        } else {
            const kahootlayouticon = document.getElementById('kahootlayouticon');
            if (kahootlayouticon) kahootlayouticon.style.color = '#000';
        }
    } else {
        moon.style.display = 'none';
        sun.style.display = 'inline';
        root.style.setProperty('--light-color', 'rgba(255, 255, 255, 0.75)');
        root.style.setProperty('--dark-color', 'rgba(255, 255, 255, 0.094)');
        root.style.setProperty('--light-bg', "#efeef5");
        root.style.setProperty('--dark-bg', "#000");
        root.style.setProperty('--light-text', '#000');
        root.style.setProperty('--dark-text', '#fff');
        sun.style.color = '#fff';

        allSubButtons.forEach(button => {
            const svg = button.querySelector('svg');
            if (svg) {
                svg.style.stroke = '#fff';
            }
        });

        if (kahootlayout.classList.contains('primary')) {
            const gformslayouticon = document.getElementById('gformslayouticon');
            if (gformslayouticon) gformslayouticon.style.color = '#fff';
        } else {
            const kahootlayouticon = document.getElementById('kahootlayouticon');
            if (kahootlayouticon) kahootlayouticon.style.color = '#fff';
        }
    }
}

// Layout switching
function kahootlayoutPressed() {
    if (!kahootlayout.classList.contains('primary')) {
        kahootlayout.classList.remove('null');
        kahootlayout.classList.add('primary', 'highlight');
        gformslayout.classList.remove('primary', 'highlight');
        gformslayout.classList.add('null');
        const kahootlayouticon = document.getElementById('kahootlayouticon');
        if (kahootlayouticon) kahootlayouticon.style.color = '#fff';
        
        const gformslayouticon = document.getElementById('gformslayouticon');
        if (body.classList.contains('dark')) {
            if (gformslayouticon) gformslayouticon.style.color = '#000';
        } else {
            if (gformslayouticon) gformslayouticon.style.color = '#fff';
        }
        kahootframe.style.display = 'block';
        gformsframe.style.display = 'none';
        displayCurrentQuestion();
    }
}

function gformslayoutPressed() {
    if (!gformslayout.classList.contains('primary')) {
        gformslayout.classList.remove('null');
        gformslayout.classList.add('primary', 'highlight');
        kahootlayout.classList.remove('primary', 'highlight');
        kahootlayout.classList.add('null');
        const gformslayouticon = document.getElementById('gformslayouticon');
        if (gformslayouticon) gformslayouticon.style.color = '#fff';
        
        const kahootlayouticon = document.getElementById('kahootlayouticon');
        if (body.classList.contains('dark')) {
            if (kahootlayouticon) kahootlayouticon.style.color = '#000';
        } else {
            if (kahootlayouticon) kahootlayouticon.style.color = '#fff';
        }
        kahootframe.style.display = 'none';
        gformsframe.style.display = 'block';
        displayAllQuestionsGForms();
    }
}

// Subject switching
function subPressed(clickedButton, subtext) {
    allSubButtons.forEach(btn => {
        btn.classList.remove('primary', 'highlight');
        btn.classList.add('null', 'icon');
        const span = btn.querySelector('span');
        if (span) span.style.display = 'none';
        const svg = btn.querySelector('svg');
        if (svg) {
            svg.style.stroke = (body.classList.contains('dark') ? '#000' : '#fff');
        }
    });

    clickedButton.classList.remove('null', 'icon');
    clickedButton.classList.add('primary', 'highlight');
    const span = clickedButton.querySelector('span');
    if (span) span.style.display = 'inline';
    const svg = clickedButton.querySelector('svg');
    if (svg) svg.style.stroke = '#fff';
    
    currentSubject = subtext;
    currentQuestionIndex = 1;
    
    if (kahootlayout.classList.contains('primary')) {
        displayCurrentQuestion();
    } else {
        displayAllQuestionsGForms();
    }
}

function displayCurrentQuestion() {
    if (!subjectData[currentSubject] || !subjectData[currentSubject].questions) return;
    
    const questions = subjectData[currentSubject].questions;
    const questionData = questions[currentQuestionIndex];
    
    if (!questionData) return;
    
    // Update question text
    const questionElement = kahootframe.querySelector('.kahootQuestion');
    if (questionElement) {
        questionElement.textContent = `Q${currentQuestionIndex}: ${questionData.question}`;
    }
    
    // Update options
    const optionElements = ['.o1', '.o2', '.o3', '.o4'];
    optionElements.forEach((selector, index) => {
        const optionSpan = kahootframe.querySelector(selector);
        if (optionSpan && questionData.options[index]) {
            // Check if option contains image tag
            if (questionData.options[index].includes('<image src=')) {
                const imgMatch = questionData.options[index].match(/src="([^"]+)"/);
                if (imgMatch) {
                    optionSpan.innerHTML = `<img src="${imgMatch[1]}" style="max-width: 100%; max-height: 200px; object-fit: contain;">`;
                }
            } else {
                optionSpan.textContent = questionData.options[index];
            }
        }
    });
    
    // Restore selected answer if exists
    const allButtons = kahootframe.querySelectorAll('.option-button');
    allButtons.forEach(btn => btn.classList.remove('primary'));
    
    if (userAnswers[currentSubject] && userAnswers[currentSubject][currentQuestionIndex] !== undefined) {
        const selectedIndex = userAnswers[currentSubject][currentQuestionIndex];
        if (allButtons[selectedIndex]) {
            allButtons[selectedIndex].classList.add('primary');
        }
    }
    
    // Add/update navigation buttons
    updateKahootNavigation();
}

// Update Kahoot navigation
function updateKahootNavigation() {
    let navDiv = kahootframe.querySelector('.kahoot-navigation');
    if (!navDiv) {
        navDiv = document.createElement('div');
        navDiv.className = 'kahoot-navigation';
        navDiv.style.cssText = 'position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); display: flex; gap: 10px; align-items: center; z-index: 10;';
        kahootframe.appendChild(navDiv);
    }
    
    const totalQuestions = Object.keys(subjectData[currentSubject].questions).length;
    const subjectOrder = ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'Mental Ability'];
    const currentSubjectIndex = subjectOrder.indexOf(currentSubject);
    const isLastSubject = currentSubjectIndex === subjectOrder.length - 1;
    const isLastQuestionOfSubject = currentQuestionIndex === totalQuestions;
    
    let nextButtonText = 'Next';
    if (isLastQuestionOfSubject && !isLastSubject) {
        nextButtonText = 'Next Subject →';
    }
    
    navDiv.innerHTML = `
        <button class="card highlight" onclick="previousQuestion()" ${currentQuestionIndex === 1 ? 'disabled' : ''} 
            style="padding: 10px 20px; cursor: ${currentQuestionIndex === 1 ? 'not-allowed' : 'pointer'}; opacity: ${currentQuestionIndex === 1 ? '0.5' : '1'}">
            Previous
        </button>
        <span style="font-size: 14pt;">${currentQuestionIndex} / ${totalQuestions}</span>
        <button class="card highlight" onclick="nextQuestion()" ${isLastQuestionOfSubject && isLastSubject ? 'disabled' : ''} 
            style="padding: 10px 20px; cursor: ${isLastQuestionOfSubject && isLastSubject ? 'not-allowed' : 'pointer'}; opacity: ${isLastQuestionOfSubject && isLastSubject ? '0.5' : '1'}">
            ${nextButtonText}
        </button>
        <button class="card primary highlight" onclick="submitTest()" style="padding: 10px 20px; margin-left: 20px;">
            Submit Test
        </button>
    `;
}

// Navigation functions
function nextQuestion() {
    const totalQuestions = Object.keys(subjectData[currentSubject].questions).length;
    if (currentQuestionIndex < totalQuestions) {
        currentQuestionIndex++;
        displayCurrentQuestion();
    } else {
        // Move to next subject
        const subjectOrder = ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'Mental Ability'];
        const currentIndex = subjectOrder.indexOf(currentSubject);
        
        if (currentIndex < subjectOrder.length - 1) {
            const nextSubject = subjectOrder[currentIndex + 1];
            const nextButton = allSubButtons[currentIndex + 1];
            
            // Switch to next subject
            subPressed(nextButton, nextSubject);
        }
    }
}

function previousQuestion() {
    if (currentQuestionIndex > 1) {
        currentQuestionIndex--;
        displayCurrentQuestion();
    }
}

// Option selection for Kahoot
function selectOption(button, optionClass) {
    const optionIndex = parseInt(optionClass.replace('o', '')) - 1;
    
    const isAlreadySelected = button.classList.contains('primary');
    
    // Get kahoot frame specifically
    const frame = document.getElementById('kahootframe');
    if (!frame) return;
    
    const allButtons = frame.querySelectorAll('.option-button');
    allButtons.forEach(btn => btn.classList.remove('primary'));
    
    if (!isAlreadySelected) {
        button.classList.add('primary');
        // Save answer
        if (!userAnswers[currentSubject]) {
            userAnswers[currentSubject] = {};
        }
        userAnswers[currentSubject][currentQuestionIndex] = optionIndex;
    } else {
        // Deselect
        if (userAnswers[currentSubject]) {
            delete userAnswers[currentSubject][currentQuestionIndex];
        }
    }
}

// Display all questions in GForms style
function displayAllQuestionsGForms() {
    if (!subjectData[currentSubject] || !subjectData[currentSubject].questions) return;
    
    const questions = subjectData[currentSubject].questions;
    const centerElement = gformsframe.querySelector('CENTER');
    
    if (!centerElement) return;
    
    centerElement.innerHTML = '';
    
    Object.keys(questions).forEach(qNum => {
        const questionData = questions[qNum];
        
        const questionCard = document.createElement('div');
        questionCard.className = 'card highlight';
        questionCard.style.cssText = 'width: 500px; height: fit-content; padding: 10px; --r: 50px; border-radius: 50px; margin-bottom: 20px;';
        
        const questionText = document.createElement('span');
        questionText.className = 'gformsQuestion';
        questionText.textContent = `Q${qNum}: ${questionData.question}`;
        questionCard.appendChild(questionText);
        
        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'options';
        optionsDiv.style.width = '100%';
        
        questionData.options.forEach((option, index) => {
            const optionCard = document.createElement('div');
            optionCard.className = 'card highlight';
            optionCard.style.cssText = 'margin: 10px; border-radius: 30px; --r: 30px; width: calc(100% - 40px); justify-content: left; align-items: left; display: flex; gap: 10px;';
            
            const button = document.createElement('button');
            button.className = 'secondary highlight option-button';
            button.style.cssText = 'padding-left: 20px; padding-right: 20px;';
            button.onclick = () => selectOptionGForms(button, qNum, index);
            button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-icon lucide-check"><path d="M20 6 9 17l-5-5" /></svg>`;
            
            const optionSpan = document.createElement('span');
            optionSpan.style.cursor = 'pointer';
            optionSpan.onclick = () => selectOptionGForms(button, qNum, index);
            
            // Check if option contains image tag
            if (option.includes('<image src=')) {
                const imgMatch = option.match(/src="([^"]+)"/);
                if (imgMatch) {
                    optionSpan.innerHTML = `<img src="${imgMatch[1]}" style="max-width: 200px; max-height: 150px; object-fit: contain;">`;
                }
            } else {
                optionSpan.textContent = option;
            }
            
            optionCard.appendChild(button);
            optionCard.appendChild(optionSpan);
            optionsDiv.appendChild(optionCard);
            
            // Restore selected answer
            if (userAnswers[currentSubject] && userAnswers[currentSubject][qNum] === index) {
                button.classList.add('primary');
            }
        });
        
        questionCard.appendChild(optionsDiv);
        centerElement.appendChild(questionCard);
    });
    
    // Add navigation for next subject
    const subjectOrder = ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'Mental Ability'];
    const currentSubjectIndex = subjectOrder.indexOf(currentSubject);
    const isLastSubject = currentSubjectIndex === subjectOrder.length - 1;
    
    const navDiv = document.createElement('div');
    navDiv.style.cssText = 'display: flex; gap: 10px; align-items: center; justify-content: center; margin: 20px;';
    
    if (!isLastSubject) {
        const nextSubjectButton = document.createElement('button');
        nextSubjectButton.className = 'card highlight';
        nextSubjectButton.style.cssText = 'padding: 15px 30px; font-size: 16pt;';
        nextSubjectButton.textContent = 'Next Subject →';
        nextSubjectButton.onclick = () => {
            const nextSubject = subjectOrder[currentSubjectIndex + 1];
            const nextButton = allSubButtons[currentSubjectIndex + 1];
            subPressed(nextButton, nextSubject);
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
        navDiv.appendChild(nextSubjectButton);
    }
    
    // Add submit button
    const submitButton = document.createElement('button');
    submitButton.className = 'card primary highlight';
    submitButton.style.cssText = 'padding: 15px 30px; font-size: 16pt;';
    submitButton.textContent = 'Submit Test';
    submitButton.onclick = submitTest;
    navDiv.appendChild(submitButton);
    
    centerElement.appendChild(navDiv);
}

// Option selection for GForms
function selectOptionGForms(button, questionNum, optionIndex) {
    const isAlreadySelected = button.classList.contains('primary');
    
    // Find all buttons in the same question card
    const questionCard = button.closest('.card.highlight');
    if (!questionCard) return;
    
    const allButtons = questionCard.querySelectorAll('.option-button');
    allButtons.forEach(btn => btn.classList.remove('primary'));
    
    if (!isAlreadySelected) {
        button.classList.add('primary');
        // Save answer
        if (!userAnswers[currentSubject]) {
            userAnswers[currentSubject] = {};
        }
        userAnswers[currentSubject][questionNum] = optionIndex;
    } else {
        // Deselect
        if (userAnswers[currentSubject]) {
            delete userAnswers[currentSubject][questionNum];
        }
    }
}

// Submit test
function submitTest() {
    const rollNo = document.getElementById('rollno').value;
    
    if (!rollNo) {
        alert('Please enter your Roll Number before submitting!');
        return;
    }
    
    if (!isAuthenticated) {
        const password = prompt('Enter password to submit test:');
        if (!password) return;
        
        // Here you can add password validation
        // For now, we'll just accept any non-empty password
        isAuthenticated = true;
    }
    
    // Generate results - only save user answers
    const results = {};
    
    Object.keys(subjectData).forEach(subject => {
        results[subject] = {};
        const questions = subjectData[subject].questions;
        
        Object.keys(questions).forEach(qNum => {
            const userAnswer = userAnswers[subject] && userAnswers[subject][qNum] !== undefined 
                ? userAnswers[subject][qNum] 
                : null;
            
            results[subject][qNum] = {
                question: questions[qNum].question,
                userAnswer: userAnswer,
                selectedOption: userAnswer !== null ? questions[qNum].options[userAnswer] : null
            };
        });
    });
    
    // Create single combined results file
    const combinedResult = {
        rollNo: rollNo,
        timestamp: new Date().toISOString(),
        subjects: results
    };
    
    // Save to local folder (this will trigger a download, but you can modify it to send to server later)
    const blob = new Blob([JSON.stringify(combinedResult, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test_results_${rollNo}_${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('Test submitted successfully! Your answers have been saved.');
    
    // TODO: Replace download with server upload
    // fetch('/api/submit-test', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(combinedResult)
    // });
}

// Window resize handling
const resizeWarning = document.querySelector('.resize-warning');
let resizeTimeout;

function showResizeWarning(show) {
    if (show) {
        resizeWarning.style.display = 'flex';
        void resizeWarning.offsetWidth;
        resizeWarning.classList.add('show');
    } else {
        resizeWarning.classList.remove('show');
        setTimeout(() => {
            if (!resizeWarning.classList.contains('show')) {
                resizeWarning.style.display = 'none';
            }
        }, 300);
    }
}

function checkWindowSize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        showResizeWarning(window.innerWidth < 730 || window.innerHeight < 400);
    }, 25);
}

checkWindowSize();
window.addEventListener('resize', checkWindowSize);

// Load test info
fetch('testinfo.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Test info not found');
        }
        return response.json();
    })
    .then(testInfo => {
        document.getElementById('testname').textContent = testInfo.testname || 'Test';
    })
    .catch(error => {
        console.error('Error loading test info:', error);
        document.getElementById('testname').textContent = 'Test';
    });

loadAllSubjects();
