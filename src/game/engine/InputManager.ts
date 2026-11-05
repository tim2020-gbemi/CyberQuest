export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  action: boolean; // Jump, Shield, Select
  laser: boolean;  // Shoot / Firewall blast
  pause: boolean;
}

export class InputManager {
  private held: Record<string, boolean> = {};
  private justPressedMap: Record<string, boolean> = {};
  private virtualState: Record<string, boolean> = {};

  constructor() {
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
  }

  public attach() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('blur', this.handleBlur);
  }

  public detach() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('blur', this.handleBlur);
    this.reset();
  }

  public reset() {
    this.held = {};
    this.justPressedMap = {};
    this.virtualState = {};
  }

  private handleKeyDown(e: KeyboardEvent) {
    // Prevent scrolling with arrows or space in game
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault();
    }

    if (!this.held[e.code]) {
      this.justPressedMap[e.code] = true;
    }
    this.held[e.code] = true;
  }

  private handleKeyUp(e: KeyboardEvent) {
    this.held[e.code] = false;
  }

  private handleBlur() {
    // Clear all held keys on window blur to avoid stuck keys
    this.held = {};
    this.justPressedMap = {};
    this.virtualState = {};
  }

  // Set virtual button state from touch controls
  public setVirtualKey(key: string, pressed: boolean) {
    if (pressed && !this.virtualState[key]) {
      this.justPressedMap[key] = true;
    }
    this.virtualState[key] = pressed;
  }

  public isHeld(key: 'left' | 'right' | 'up' | 'down' | 'action' | 'laser' | 'pause'): boolean {
    switch (key) {
      case 'left':
        return !!(this.held['ArrowLeft'] || this.held['KeyA'] || this.virtualState['left']);
      case 'right':
        return !!(this.held['ArrowRight'] || this.held['KeyD'] || this.virtualState['right']);
      case 'up':
        return !!(this.held['ArrowUp'] || this.held['KeyW'] || this.virtualState['up']);
      case 'down':
        return !!(this.held['ArrowDown'] || this.held['KeyS'] || this.virtualState['down']);
      case 'action':
        return !!(this.held['Space'] || this.held['Enter'] || this.held['KeyZ'] || this.virtualState['action']);
      case 'laser':
        return !!(this.held['KeyF'] || this.held['KeyX'] || this.virtualState['laser']);
      case 'pause':
        return !!(this.held['Escape'] || this.held['KeyP'] || this.virtualState['pause']);
    }
  }

  public isJustPressed(key: 'left' | 'right' | 'up' | 'down' | 'action' | 'laser' | 'pause'): boolean {
    let triggered = false;
    switch (key) {
      case 'left':
        triggered = !!(this.justPressedMap['ArrowLeft'] || this.justPressedMap['KeyA'] || this.justPressedMap['left']);
        break;
      case 'right':
        triggered = !!(this.justPressedMap['ArrowRight'] || this.justPressedMap['KeyD'] || this.justPressedMap['right']);
        break;
      case 'up':
        triggered = !!(this.justPressedMap['ArrowUp'] || this.justPressedMap['KeyW'] || this.justPressedMap['up']);
        break;
      case 'down':
        triggered = !!(this.justPressedMap['ArrowDown'] || this.justPressedMap['KeyS'] || this.justPressedMap['down']);
        break;
      case 'action':
        triggered = !!(this.justPressedMap['Space'] || this.justPressedMap['Enter'] || this.justPressedMap['KeyZ'] || this.justPressedMap['action']);
        break;
      case 'laser':
        triggered = !!(this.justPressedMap['KeyF'] || this.justPressedMap['KeyX'] || this.justPressedMap['laser']);
        break;
      case 'pause':
        triggered = !!(this.justPressedMap['Escape'] || this.justPressedMap['KeyP'] || this.justPressedMap['pause']);
        break;
    }
    return triggered;
  }

  // End of frame tick: clear edge triggers
  public endFrame() {
    this.justPressedMap = {};
  }
}
