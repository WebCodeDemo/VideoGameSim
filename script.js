// Game configuration object for easy tuning
const gameConfig = {
    // XP required for the first level-up
    baseXPRequirement: 100,
    // Factor by which XP requirement increases each level
    xpScalingFactor: 1.5,
    // Base XP gained per level
    baseXPGain: 10,
    // XP gain increase per level
    xpGainLevelScale: 5,
    // Base skill XP
    baseSkillXP: 20,
    // Skill XP scaling factor
    skillXPScalingFactor: 20,
    // Maximum random XP bonus for skills
    maxSkillXPBonus: 90
};

let currentLevel = 1;
let characterLevel = 1;
let currentXP = 0;
let xpToNextLevel = gameConfig.baseXPRequirement;
let skillPoints = 0;

let isSkillTreeUnlocked = false;
let isUnlockingSkill = false;

const playButton = document.getElementById('play-button');
const nextLevelButton = document.getElementById('next-level-button');
const startScreen = document.getElementById('start-screen');
const resultScreen = document.getElementById('result-screen');
const resultText = document.getElementById('result-text');
const characterLevelElement = document.getElementById('character-level');
const currentXPElement = document.getElementById('current-xp');
const xpToNextLevelElement = document.getElementById('xp-to-next-level');
const xpBar = document.getElementById('xp-bar');
const skillPointsElement = document.getElementById('skill-points');
const skillTreeContainer = document.getElementById('skill-tree-container');

const soCloseOverlay = document.getElementById('so-close-overlay');

const skillTree = {
    speed: ['Sprint', 'Speed Booster', 'Air Dash', 'Short Teleport', 'Long Teleport'],
    agility: ['Wall Jump', 'Multi Parkour', 'Pole Vault', 'Grappling Hook', 'Walking on Water'],
    glitches: ['Animation Skip', 'Glitch Step', 'Phase Through Walls', 'Sequence Break', 'God Glitch'],
    combat: ['Heavy Punch', 'Counter Attack', 'Ultimate Combo Strikes', 'Lightning Warfare', 'Tactical Nuke']
};

const unlockedSkills = {
    speed: [],
    agility: [],
    glitches: [],
    combat: []
};

playButton.addEventListener('click', startLevel);
nextLevelButton.addEventListener('click', (event) => {
    event.preventDefault(); // Prevent default button behavior
    nextLevelButton.classList.add('pressed');
    
    const rect = nextLevelButton.getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;
    createSparks(x, y);
    
    // Add a delay before starting the next level
    setTimeout(() => {
        nextLevelButton.classList.remove('pressed');
        currentLevel++;
        startLevel();
    }, 500); // 500ms delay, adjust as needed
});
nextLevelButton.addEventListener('mousedown', () => {
    nextLevelButton.classList.add('pressed');
});

nextLevelButton.addEventListener('mouseup', (event) => {
    nextLevelButton.classList.remove('pressed');
    const rect = nextLevelButton.getBoundingClientRect();
    //createSparks(event.clientX - rect.left, event.clientY - rect.top);
});

nextLevelButton.addEventListener('mouseleave', () => {
    nextLevelButton.classList.remove('pressed');
});

function createSparks(x, y) {
    const sparkCount = 20;
    const sparkContainer = document.createElement('div');
    sparkContainer.className = 'spark-container';
    sparkContainer.style.left = `${x}px`;
    sparkContainer.style.top = `${y}px`;
    document.body.appendChild(sparkContainer);

    for (let i = 0; i < sparkCount; i++) {
        const spark = document.createElement('div');
        spark.className = 'spark';
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 50 + 50;
        spark.style.setProperty('--angle', angle);
        spark.style.setProperty('--speed', `${speed}px`);
        sparkContainer.appendChild(spark);
    }

    setTimeout(() => {
        sparkContainer.remove();
    }, 1000);
}

function createConfetti() {
    const confettiCount = 200;
    const confettiContainer = document.createElement('div');
    confettiContainer.id = 'confetti-container';
    document.body.appendChild(confettiContainer);

    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = `${Math.random() * 100}vw`;
        confetti.style.animationDuration = `${Math.random() * 3 + 2}s`;
        confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
        confettiContainer.appendChild(confetti);
    }

    setTimeout(() => {
        confettiContainer.remove();
    }, 5000);
}

function getRandomUnlockedSkill() {
    const allUnlockedSkills = Object.values(unlockedSkills).flat();
    if (allUnlockedSkills.length === 0) return null;
    
    const randomSkill = allUnlockedSkills[Math.floor(Math.random() * allUnlockedSkills.length)];
    const skillBranch = Object.keys(unlockedSkills).find(branch => unlockedSkills[branch].includes(randomSkill));
    const skillIndex = skillTree[skillBranch].indexOf(randomSkill);
    
    const randomFactor = Math.floor(Math.random() * gameConfig.maxSkillXPBonus);
    
    // Calculate bonus XP based on skill position (later skills give more XP)
    const bonusXP = gameConfig.baseSkillXP + (skillIndex * gameConfig.skillXPScalingFactor) + randomFactor;
	
	
	if (randomSkill === 'God Glitch') {
        handleGodGlitch();
    }
    
    return { skill: randomSkill, branch: skillBranch, bonusXP };
}

function handleGodGlitch() {
    skillPoints += 20;
    updateXPDisplay();
    
    alert("God Glitch activated! You've gained 20 skill points!");
}

function startLevel() {
    startScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');
    nextLevelButton.classList.add('hidden');
    resultText.innerHTML = '';

    const levelXPGain = gameConfig.baseXPGain + (currentLevel - 1) * gameConfig.xpGainLevelScale;
    const results = [
        `Level Cleared:  ${levelXPGain + Math.floor(Math.random() * 10)} XP`,
        `Speed bonus:  ${Math.floor(Math.random() * (5 + currentLevel))} XP`,
        `Combat bonus:  ${Math.floor(Math.random() * (3 + currentLevel))} XP`
    ];

    const usedSkill = getRandomUnlockedSkill();
    if (usedSkill) {
        results.unshift(`You used ${usedSkill.skill}:  ${usedSkill.bonusXP} XP`);
    }

    displayResults(results);
}

async function displayResults(results) {
    let totalXPGained = 0;
    resultText.innerHTML = ''; // Clear previous results

    for (const [index, result] of results.entries()) {
        const resultItem = document.createElement('div');
        resultItem.classList.add('result-item');
        
        const xpMatch = result.match(/(\d+) XP/);
        if (xpMatch) {
            const xpValue = xpMatch[1];
            const beforeXP = result.split(xpValue + ' XP')[0];
            const afterXP = result.split(xpValue + ' XP')[1] || '';
            
            resultItem.innerHTML = `${beforeXP}<span class="xp-number">${xpValue} XP</span>${afterXP}`;
        } else {
            resultItem.textContent = result;
        }
        
        resultText.appendChild(resultItem);
        
        await new Promise(resolve => setTimeout(resolve, 500)); // Delay between items
        resultItem.classList.add('visible');
        
        if (xpMatch) {
            const xpNumber = resultItem.querySelector('.xp-number');
            xpNumber.classList.add('animate');
            totalXPGained += parseInt(xpMatch[1]);
        }
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
    addXP(totalXPGained);
    updatePlayButtons();
    nextLevelButton.classList.remove('hidden');
}

function addXP(xp) {
    currentXP += xp;
    while (currentXP >= xpToNextLevel) {
        levelUp();
    }
    updateXPDisplay();
    updateUndulatingButtons();
}

function levelUp() {
    characterLevel++;
    currentXP -= xpToNextLevel;
    xpToNextLevel = Math.floor(xpToNextLevel * gameConfig.xpScalingFactor);
    skillPoints++;
    resultText.innerHTML += `<br>Congratulations! Your character reached level ${characterLevel}!<br>`;
    resultText.innerHTML += `You gained 1 skill point!<br>`;
    
    if (!isSkillTreeUnlocked) {
        skillTreeContainer.classList.remove('hidden');
        resultText.innerHTML += `<br>The Skill Tree has been unlocked! You can now spend your skill points to gain new abilities.<br>`;
        isSkillTreeUnlocked = true;
    }
    
    updateSkillTree();
	
	// confetti
	if (characterLevel >= 4) {
        createConfetti();
    }
}

function updateXPDisplay() {
    characterLevelElement.textContent = characterLevel;
    currentXPElement.textContent = currentXP;
    xpToNextLevelElement.textContent = xpToNextLevel;
    skillPointsElement.textContent = skillPoints;
    const xpPercentage = (currentXP / xpToNextLevel) * 100;
    xpBar.style.width = `${xpPercentage}%`;

    // Show or hide the "SO CLOSE!" overlay
    if (xpPercentage >= 90) {
        soCloseOverlay.classList.add('visible');
    } else {
        soCloseOverlay.classList.remove('visible');
    }
}

function updatePlayButtons() {
    playButton.textContent = `Play Level ${currentLevel}`;
    nextLevelButton.textContent = `Play Level ${currentLevel + 1}`;
}

function updateSkillTree() {
    for (const [branch, skills] of Object.entries(skillTree)) {
        const branchElement = document.querySelector(`#${branch}-branch .skill-list`);
        branchElement.innerHTML = '';
        
        const unlockedCount = unlockedSkills[branch].length;
        const visibleSkills = skills.slice(0, unlockedCount + 2);
        
        visibleSkills.forEach((skill, index) => {
            const button = document.createElement('button');
            button.textContent = index <= unlockedCount ? skill : '???';
            button.classList.add('skill-button');
            
            if (unlockedSkills[branch].includes(skill)) {
                button.classList.add('unlocked');
                button.disabled = true;
            } else if (index === unlockedCount) {
                button.addEventListener('click', () => unlockSkill(branch, skill));
                if (skillPoints > 0) {
                    button.classList.add('available-skill');
                }
            } else {
                button.classList.add('locked');
                button.disabled = true;
            }
            
            branchElement.appendChild(button);
        });
    }
}

function updateUndulatingButtons() {
    const availableButtons = document.querySelectorAll('.skill-button:not(.unlocked):not(.locked)');
    availableButtons.forEach(button => {
        if (skillPoints > 0) {
            button.classList.add('available-skill');
        } else {
            button.classList.remove('available-skill');
        }
    });
}

function unlockSkill(branch, skill) {
    if (skillPoints > 0 && !unlockedSkills[branch].includes(skill)) {

        unlockedSkills[branch].push(skill);
        skillPoints--;
        updateXPDisplay();
        updateSkillTree();
        updateUndulatingButtons();
		resultText.innerHTML = ''; // Clear previous results
        resultText.innerHTML += `<br>You unlocked the "${skill}" skill!<br>`;
        
        if (unlockedSkills[branch].length === skillTree[branch].length) {
            displayBranchCompletion(branch);
        }
        
        if (unlockedSkills[branch].length < skillTree[branch].length) {
            const nextSkill = skillTree[branch][unlockedSkills[branch].length];
            resultText.innerHTML += `<br>New skill revealed: ${nextSkill}<br>`;
        }
        
        if (isAllSkillsUnlocked()) {
            displayGameCompletion();
        }

    }
}

function displayBranchCompletion(branch) {
    let branchCompletionMessage = '';
    switch(branch) {
        case 'speed':
            branchCompletionMessage = `
                <div class="completion-message speed-completion">
                    <h3>Speed Demon Unleashed!</h3>
                    <p>Congratulations! You've mastered all speed skills!</p>
                    <p>You're now faster than the wind, a blur on the screen.</p>
                    <p>You are a highly respected speedrunner with tons of fans.</p>
                </div>
            `;
            break;
        case 'agility':
            branchCompletionMessage = `
                <div class="completion-message agility-completion">
                    <h3>Acrobatic Perfection Achieved!</h3>
                    <p>Incredible! You've unlocked all agility skills!</p>
                    <p>You move with the grace of a dancer and the precision of a surgeon.</p>
                    <p>The entire game world is your playground - nothing is out of reach!</p>
                </div>
            `;
            break;
        case 'glitches':
            branchCompletionMessage = `
                <div class="completion-message glitches-completion">
                    <h3>Reality Hacker Supreme!</h3>
                    <p>Mind-blowing! You've conquered all glitch skills!</p>
                    <p>The game's code bends to your will, physics cowers before you.</p>
                    <p>You see the code, you are the anomaly in the system.</p>
                </div>
            `;
            break;
        case 'combat':
            branchCompletionMessage = `
                <div class="completion-message combat-completion">
                    <h3>Ultimate Warrior Ascended!</h3>
                    <p>Phenomenal! You've mastered all combat skills!</p>
                    <p>Your attacks are so powerful they shake the computer itself.</p>
                    <p>Enemies tremble at your approach, final bosses quake as you pass.</p>
                </div>
            `;
            break;
    }
    resultText.innerHTML += branchCompletionMessage;
}

function isAllSkillsUnlocked() {
    return Object.keys(skillTree).every(branch => 
        unlockedSkills[branch].length === skillTree[branch].length
    );
}

function displayGameCompletion() {
    const gameCompletionMessage = `
        <div class="completion-message game-completion">
            <h2>Congratulations!</h2>
            <p>🏆 YOU WON! 🏆</p>
            <p>Your dedication, skill, and perseverance have transformed you into the ultimate video game master.</p>
            <p>From speedrunning to hacking, from combat mastery to impossible agility, you've completed it all.</p>
            <p>Your journey may end here, but your legend will live on forever in the halls of gaming history!</p>
        </div>
    `;
    resultText.innerHTML += gameCompletionMessage;
    
    // Optionally, disable further gameplay
    // playButton.disabled = true;
    // nextLevelButton.disabled = true;
}

updateXPDisplay();
updatePlayButtons();
updateSkillTree();
skillTreeContainer.classList.add('hidden');