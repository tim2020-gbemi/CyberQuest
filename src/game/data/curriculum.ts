import { Badge, CharacterSkin, QuizQuestion, SectorMeta } from '../types';

export const CHARACTER_SKINS: CharacterSkin[] = [
  {
    id: 'byte',
    name: 'Byte',
    role: 'Cyber Scout Bot',
    color: '#06b6d4', // cyan-500
    secondaryColor: '#38bdf8', // sky-400
    glowColor: 'rgba(6, 182, 212, 0.6)',
    description: 'A curious explorer bot programmed with boundless energy and a friendly smile.',
  },
  {
    id: 'pixel',
    name: 'Pixel',
    role: 'Matrix Cat',
    color: '#ec4899', // pink-500
    secondaryColor: '#f43f5e', // rose-500
    glowColor: 'rgba(236, 72, 153, 0.6)',
    description: 'Swift, agile, and sharp-eyed at sniffing out sneaky bugs and glitches.',
  },
  {
    id: 'spark',
    name: 'Spark',
    role: 'Energy Sprite',
    color: '#eab308', // yellow-500
    secondaryColor: '#f59e0b', // amber-500
    glowColor: 'rgba(234, 179, 8, 0.6)',
    description: 'A lightning-fast spark of pure electricity powering the circuit board.',
  },
  {
    id: 'nova',
    name: 'Nova',
    role: 'Space Cadet',
    color: '#8b5cf6', // purple-500
    secondaryColor: '#a855f7', // purple-400
    glowColor: 'rgba(139, 92, 246, 0.6)',
    description: 'An intrepid cyber astronaut charting the vast cosmos of the World Wide Web.',
  },
];

export const SECTORS: SectorMeta[] = [
  {
    id: 'sector_1',
    number: 1,
    title: 'Inside the Computer',
    subtitle: 'The Hardware Wonderland',
    theme: 'Hardware & Machine Anatomy',
    accentColor: '#06b6d4',
    description: 'Shrink down and explore the motherboard! Discover how the CPU thinks, RAM remembers, and storage keeps your files safe.',
    learningGoal: 'Understand input, processing, memory, storage, and output devices.',
    concepts: ['CPU (The Brain)', 'RAM (Short-Term Memory)', 'Storage (Long-Term Vault)', 'Input vs Output', 'Motherboard'],
  },
  {
    id: 'sector_2',
    number: 2,
    title: 'What Computers Can Do',
    subtitle: 'Algorithms & Digital Magic',
    theme: 'Software, Code & Creativity',
    accentColor: '#10b981',
    description: 'Learn how computers follow step-by-step algorithms, create art and music, power spacecraft, and help humans solve big challenges!',
    learningGoal: 'Learn what software is, how algorithms work, and how computers automate tasks.',
    concepts: ['Step-by-step Algorithms', 'Problem Solving & Loops', 'Creating Art & Music', 'Automation & Science'],
  },
  {
    id: 'sector_3',
    number: 3,
    title: 'The Cyber Shield',
    subtitle: 'Internet Safety & Phishing Patrol',
    theme: 'Online Safety & Security',
    accentColor: '#f59e0b',
    description: 'Surf the Cyber Highway with your security shield! Spot fake giveaway traps, deflect sneaky phishing hooks, and forge invincible passwords.',
    learningGoal: 'Spot online scams, safeguard private information, and create secure passphrases.',
    concepts: ['Strong Passwords', 'Phishing & Fake Traps', 'Personal vs Public Info', 'Secure Websites (HTTPS)'],
  },
  {
    id: 'sector_4',
    number: 4,
    title: 'The Digital Citizen',
    subtitle: 'Digital Footprint & Netiquette',
    theme: 'Responsibility & Kindness',
    accentColor: '#8b5cf6',
    description: 'Travel through the Digital Village. Build a positive digital footprint, practice kind netiquette, balance screen time, and verify facts!',
    learningGoal: 'Be kind, respectful, and safe online, and understand your digital footprint.',
    concepts: ['Digital Footprint Permanence', 'Netiquette & Kindness', 'Being an Upstander', 'Screen Time Balance', 'Fact-Checking'],
  },
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // Sector 1 Questions
  {
    id: 'q1_1',
    sectorId: 'sector_1',
    question: 'What is known as the "Brain" of the computer that processes all instructions?',
    options: ['The CPU (Central Processing Unit)', 'The Computer Mouse', 'The Power Cord', 'The Monitor Screen'],
    correctIndex: 0,
    explanation: 'The CPU does all the thinking and calculations, like a super-fast brain!',
    tip: 'CPU stands for Central Processing Unit.',
  },
  {
    id: 'q1_2',
    sectorId: 'sector_1',
    question: 'Which of these is an INPUT device that sends information INTO the computer?',
    options: ['Computer Speakers', 'Keyboard', 'Printer', 'Screen Monitor'],
    correctIndex: 1,
    explanation: 'A keyboard sends your typing into the computer. Speakers and monitors output sound and pictures to you!',
    tip: 'Input = puts info IN. Output = shows info OUT.',
  },
  {
    id: 'q1_3',
    sectorId: 'sector_1',
    question: 'Where are your saved games, photos, and apps stored even when the computer is turned off?',
    options: ['RAM (Working Memory)', 'The Storage Drive (SSD or Hard Drive)', 'The Mousepad', 'The Cooling Fan'],
    correctIndex: 1,
    explanation: 'Storage drives (SSDs/HDDs) hold your data permanently. RAM only holds what you are working on right now!',
    tip: 'Storage is like your backpack; RAM is like the desk surface.',
  },
  // Sector 2 Questions
  {
    id: 'q2_1',
    sectorId: 'sector_2',
    question: 'What is an "Algorithm" in computer science?',
    options: ['A type of computer virus', 'A step-by-step set of instructions to solve a task', 'A broken keyboard key', 'A math textbook'],
    correctIndex: 1,
    explanation: 'Just like a baking recipe, an algorithm tells the computer exact steps in order to finish a job!',
    tip: 'Computers can only do what our algorithms instruct them to do.',
  },
  {
    id: 'q2_2',
    sectorId: 'sector_2',
    question: 'Which of these is something computers CANNOT do on their own without human guidance or code?',
    options: ['Calculate millions of numbers per second', 'Feel real human feelings and genuine empathy', 'Play video games', 'Send emails across the planet'],
    correctIndex: 1,
    explanation: 'Computers are amazing calculation tools, but only humans have real feelings, empathy, and moral hearts!',
    tip: 'Technology is a tool; human kindness and wisdom guide it.',
  },
  // Sector 3 Questions
  {
    id: 'q3_1',
    sectorId: 'sector_3',
    question: 'Which of these makes the STRONGEST password?',
    options: ['123456', 'password', 'myname2024', 'Blue-Dolphin-Jumps-99!'],
    correctIndex: 3,
    explanation: 'Long passphrases with uppercase, lowercase, numbers, and symbols take thousands of years for hackers to guess!',
    tip: 'Combine 3-4 random words with symbols to make it easy to remember and hard to hack.',
  },
  {
    id: 'q3_2',
    sectorId: 'sector_3',
    question: 'You see a popup: "YOU WON A FREE GOLDEN CONSOLE! Click here and type your home address!" What should you do?',
    options: ['Type your address quickly before time runs out', 'Close it and tell a parent or trusted adult (It is a scam!)', 'Send it to all your classmates', 'Click the flashing buttons'],
    correctIndex: 1,
    explanation: 'Strangers never give away free consoles online! These are phishing scams trying to steal your private info.',
    tip: 'If something looks too good to be true, it is almost always a scam.',
  },
  {
    id: 'q3_3',
    sectorId: 'sector_3',
    question: 'Which information should you NEVER share with strangers or public websites online?',
    options: ['Your favorite color', 'Your home address, phone number, and school name', 'Your favorite cartoon character', 'The recipe for cookies'],
    correctIndex: 1,
    explanation: 'Your real full name, home address, school, and phone number are private keys to your real-world safety.',
    tip: 'Keep private info locked safe!',
  },
  // Sector 4 Questions
  {
    id: 'q4_1',
    sectorId: 'sector_4',
    question: 'What is your "Digital Footprint"?',
    options: ['The dust on your computer keyboard', 'The trail of photos, comments, and sites you leave behind online', 'The size of your computer monitor', 'How many steps you take while holding a phone'],
    correctIndex: 1,
    explanation: 'Everything you post, search, or comment creates a digital trail that can last forever. Think before you post!',
    tip: 'Only post things you would be proud to show your grandma or teacher.',
  },
  {
    id: 'q4_2',
    sectorId: 'sector_4',
    question: 'You notice someone being unkind or teasing a classmate in an online game chat. What is the BEST choice?',
    options: ['Join in the teasing so you fit in', 'Be an "Upstander": speak up kindly, support your classmate, and report the behavior', 'Forward the mean messages to others', 'Just pretend you didn\'t see it'],
    correctIndex: 1,
    explanation: 'Upstanders make the internet safe and welcoming by standing up for others and reporting bullying!',
    tip: 'Treat others online the same way you want to be treated in person.',
  },
  {
    id: 'q4_3',
    sectorId: 'sector_4',
    question: 'You have been playing video games for 3 hours straight and your eyes feel tired. What is the responsible move?',
    options: ['Turn the screen brightness to maximum and keep playing', 'Take a 20-minute break, stretch, drink water, and go outside', 'Drink soda and ignore the tired feeling', 'Play on two screens at once'],
    correctIndex: 1,
    explanation: 'Balancing screen time with real-world movement, outdoor play, and family time keeps your body and brain healthy!',
    tip: 'Follow the 20-20-20 rule: every 20 minutes, look 20 feet away for 20 seconds.',
  },
];

export const INITIAL_BADGES: Badge[] = [
  {
    id: 'badge_hardware',
    title: 'Hardware Architect',
    description: 'Mastered CPU, RAM, and Storage components in Sector 1!',
    icon: 'Cpu',
    sectorId: 'sector_1',
    unlocked: false,
  },
  {
    id: 'badge_algo',
    title: 'Algorithm Wizard',
    description: 'Programmed drones and solved algorithmic logic in Sector 2!',
    icon: 'Code2',
    sectorId: 'sector_2',
    unlocked: false,
  },
  {
    id: 'badge_shield',
    title: 'Phishing Detective',
    description: 'Deflected scams and shielded personal data in Sector 3!',
    icon: 'ShieldCheck',
    sectorId: 'sector_3',
    unlocked: false,
  },
  {
    id: 'badge_citizen',
    title: 'Golden Digital Citizen',
    description: 'Practiced kindness, netiquette, and digital wisdom in Sector 4!',
    icon: 'Sparkles',
    sectorId: 'sector_4',
    unlocked: false,
  },
  {
    id: 'badge_password',
    title: 'Password Fortifier',
    description: 'Forged an unbreakable 100% strength passphrase!',
    icon: 'KeyRound',
    unlocked: false,
  },
  {
    id: 'badge_quiz',
    title: 'Cyber Scholar',
    description: 'Achieved a perfect score on the Cyber Literacy Quiz!',
    icon: 'GraduationCap',
    unlocked: false,
  },
  {
    id: 'badge_master',
    title: 'Grandmaster Cyber Scout',
    description: 'Completed all 4 sectors and protected the entire Citadel!',
    icon: 'Trophy',
    unlocked: false,
  },
];

export const CODEX_CHAPTERS = [
  {
    id: 'ch1',
    title: 'What Is A Computer?',
    icon: 'Laptop',
    tag: 'Hardware Basics',
    summary: 'A computer is an electronic machine that takes in information (Input), processes it with lightning speed (CPU), uses memory (RAM), saves it (Storage), and shows results (Output).',
    sections: [
      {
        heading: 'The 4 Core Steps (IPOS)',
        text: 'Every computer works on 4 simple steps: Input (Keyboard, Mouse, Mic), Processing (CPU calculates), Output (Monitor, Speakers, Printer), and Storage (SSD or Hard Drive preserves files).',
      },
      {
        heading: 'CPU vs RAM vs Storage',
        text: 'The CPU is the brain doing the math. RAM is the temporary desktop where open apps sit while running. Storage is the filing cabinet where your photos and games stay forever even when powered off.',
      },
      {
        heading: 'Hardware vs Software',
        text: 'Hardware is the physical parts you can touch (the screen, mouse, chips). Software is the invisible code and apps that tell the hardware what to do (games, web browsers, drawing tools).',
      },
    ],
  },
  {
    id: 'ch2',
    title: 'What Can Computers Do?',
    icon: 'Rocket',
    tag: 'Software & Power',
    summary: 'Computers are universal problem-solving machines. They can calculate in a microsecond what would take humans years, but they need human creators to give them algorithms.',
    sections: [
      {
        heading: 'Creative Arts & Expression',
        text: 'Computers let you compose symphonies, animate 3D movies, draw digital paintings, edit photos, and build your own video games.',
      },
      {
        heading: 'Science, Space & Medicine',
        text: 'Space telescopes use computers to photograph distant galaxies. Doctors use computers to image the human body, design medicines, and study weather patterns to warn of storms.',
      },
      {
        heading: 'What is an Algorithm?',
        text: 'An algorithm is a step-by-step recipe. Computers cannot guess what you want; every action (like sorting songs or jumping over a ditch) must be clearly instructed in order.',
      },
    ],
  },
  {
    id: 'ch3',
    title: 'Internet Safety & Cyber Shield',
    icon: 'ShieldAlert',
    tag: 'Cyber Defense',
    summary: 'The internet is like a giant global city: amazing places to explore, but you must know the safety rules to keep yourself and your family safe.',
    sections: [
      {
        heading: 'The Secret Password Rule',
        text: 'Never use simple passwords like "123456" or your pet\'s name. Build a passphrase: combine 3 or 4 random words with numbers and symbols (e.g. "Pancake-Rocket-99!"). Never share passwords with friends—only parents!',
      },
      {
        heading: 'Beware of Phishing & Free Traps',
        text: 'Phishing is when tricksters create fake messages or popups ("YOU WON FREE ROBUX! CLICK HERE!"). They try to trick you into typing your password or downloading harmful malware. Always close them and tell a grown-up!',
      },
      {
        heading: 'Private vs Public Information',
        text: 'Private info must stay locked: your home address, telephone number, real full name, birth date, and school. Public info: your favorite game, favorite animal, or drawing.',
      },
    ],
  },
  {
    id: 'ch4',
    title: 'Responsible Digital Citizen',
    icon: 'HeartHandshake',
    tag: 'Netiquette & Life',
    summary: 'Being a great digital citizen means treating others with respect, leaving a positive digital footprint, thinking before posting, and keeping balance with the offline world.',
    sections: [
      {
        heading: 'Your Digital Footprint is Permanent',
        text: 'Once you send a message, comment, or picture online, it can be screenshotted or saved forever, even if you hit delete. Before you post, ask: "Is it kind? Is it true? Would I be happy if my teacher or parents read this?"',
      },
      {
        heading: 'Netiquette & Kindness',
        text: 'Netiquette means network etiquette. Never send mean messages, don\'t exclude classmates in group chats, and don\'t write in ALL CAPS (which feels like shouting). If you see bullying, be an Upstander—tell an adult and support your friend.',
      },
      {
        heading: 'Screen Time Harmony',
        text: 'Computers are fun, but your brain and body also need outdoor sunshine, fresh air, exercise, books, and real-life conversations with friends and family.',
      },
    ],
  },
];
