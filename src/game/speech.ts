// Voice narration engine using Web Speech API for kid-friendly interactive audio explanations

class VoiceNarrator {
  private isEnabled: boolean = true;
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private isSpeaking: boolean = false;

  constructor() {
    try {
      const stored = localStorage.getItem('cyberquest_voice_enabled');
      if (stored !== null) {
        this.isEnabled = stored === 'true';
      }
    } catch {
      this.isEnabled = true;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.loadVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.loadVoices();
      };
    }
  }

  private loadVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return;

    // Prefer a clear, friendly English voice
    const preferred = voices.find(
      v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('David'))
    ) || voices.find(v => v.lang.startsWith('en')) || voices[0];

    this.selectedVoice = preferred || null;
  }

  public setVoiceEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    try {
      localStorage.setItem('cyberquest_voice_enabled', String(enabled));
    } catch {}
    if (!enabled) {
      this.stop();
    }
  }

  public isVoiceEnabled(): boolean {
    return this.isEnabled;
  }

  public stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
    }
  }

  public speak(text: string, force: boolean = false) {
    if (!this.isEnabled && !force) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    // Cancel current speech so new explanations don't queue up awkwardly
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (!this.selectedVoice) {
      this.loadVoices();
    }
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }

    // Friendly, enthusiastic, kid-friendly cartoon tone
    utterance.rate = 1.02;
    utterance.pitch = 1.15;
    utterance.volume = 0.95;

    utterance.onstart = () => {
      this.isSpeaking = true;
    };
    utterance.onend = () => {
      this.isSpeaking = false;
    };
    utterance.onerror = () => {
      this.isSpeaking = false;
    };

    window.speechSynthesis.speak(utterance);
  }

  // Pre-built domain explanations for Hardware, Software, and Cyber Safety
  public explainCpu() {
    this.speak("CPU installed! The Central Processing Unit is the brain of the computer. It calculates and processes billions of instructions every second!");
  }

  public explainRam() {
    this.speak("RAM activated! Random Access Memory is the computer's fast working memory desk. It holds the apps and games you are playing right now!");
  }

  public explainSsd() {
    this.speak("Storage vault connected! The SSD keeps your photos, saved games, and files safe forever, even when the computer is turned off!");
  }

  public explainIO() {
    this.speak("Input and Output ports online! Input devices like the mouse and keyboard send your commands in, while output devices like the screen and speakers show and play the results!");
  }

  public explainMotherboard() {
    this.speak("Motherboard core fully powered! The motherboard connects all the computer parts together so they can communicate!");
  }

  public explainAlgorithm(step: string) {
    this.speak(`Algorithm step! ${step}. Remember: An algorithm is a step-by-step recipe that computers follow to finish a task!`);
  }

  public explainPhishBlocked() {
    this.speak("Phishing trap blocked with your Cyber Shield! Never click suspicious links or give away private passwords to strangers!");
  }

  public explainPhishCaught() {
    this.speak("Phishing trap alert! Be careful! Strangers promise free prizes online to trick you. Always protect your private information!");
  }

  public explainSafeSite() {
    this.speak("Safe website verified! Always look for the secure lock and HTTPS before typing any information!");
  }

  public explainRobotFell() {
    this.speak("Game Over! Byte fell into the glitch pit! Let's start again!");
  }

  public explainUpstander() {
    this.speak("Wonderful choice! Standing up for friends and reporting mean behavior makes the internet safe and kind for everyone!");
  }

  public explainScreenTime() {
    this.speak("Awesome choice! Taking a break to stretch and go outside keeps your eyes, body, and brain energized and healthy!");
  }

  public explainFactCheck() {
    this.speak("Smart move! Always verify facts with trusted adults or news sources before sharing rumors online!");
  }
}

export const voice = new VoiceNarrator();
