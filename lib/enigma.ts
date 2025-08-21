// lib/enigma.ts
export class EnigmaMachine {
    private static readonly ALPHABET_SIZE = 26;
    
    private static readonly ROTORS: Record<string | number, string> = {
      0: "ABCDEFGHIJKLMNOPQRSTUVWXYZ", // Identity rotor
      1: "EKMFLGDQVZNTOWYHXUSPAIBRCJ", //  rotor 1
      2: "AJDKSIRUXBLHWTMCQGZNPYFVOE", //  rotor 2
      3: "BDFHJLCPRTXVZNYEIWGAKMUSQO", //  rotor 3
      4: "ESOVPZJAYQUIRHXLNFTGKDCMWB", //  rotor 4
      5: "UKLBEPXWJVFZIYGAHCMTONDRQS", //  rotor 5
      6: "JPGVOUMFYQBENHZRDKASXLICTW", //  rotor 6
      7: "NZJHGRCXMYSWBOUFAIVLPEKQDT", //  rotor 7
      8: "FKQHTLXOCBJSPDZRAMEWNIUYGV", //  rotor 8
      // Historical Enigma rotors
      'I': "EKMFLGDQVZNTOWYHXUSPAIBRCJ",
      'II': "AJDKSIRUXBLHWTMCQGZNPYFVOE", 
      'III': "BDFHJLCPRTXVZNYEIWGAKMUSQO",
      'IV': "ESOVPZJAYQUIRHXLNFTGKDCMWB",
      'V': "VZBRGITYUPSDNHLXAWMJQOFECK"
    };
  
    // Reflectors 
    private static readonly REFLECTORS: Record<string, string> = {
      'B': "YRUHQSLDPXNGOKMIEBFZCWVJAT",
      'C': "FVPJIAOYEDRZXWGCTKUQSBNMHL"
    };
  
    // Notch positions for double stepping
    private static readonly NOTCHES: Record<string | number, string> = {
      1: 'Q', 2: 'E', 3: 'V', 4: 'J', 5: 'Z',
      'I': 'Q', 'II': 'E', 'III': 'V', 'IV': 'J', 'V': 'Z'
    };
  
    private rotorConfigs: string[] = [];
    private rotorPositions: number[] = [];
    private rotorIndices: (number | string)[] = [];
    private reflector: string = '';
    private plugboard: Map<string, string> = new Map();
  
    constructor(
      rotorIndices: (number | string)[],
      reflectorType: string = 'B',
      initialPositions: number[] = [0, 0, 0]
    ) {
      this.rotorIndices = rotorIndices;
      this.reflector = EnigmaMachine.REFLECTORS[reflectorType] || EnigmaMachine.REFLECTORS.B;
      this.rotorPositions = initialPositions.slice();
      this.setupRotors();
    }
  
    private setupRotors(): void {
      this.rotorConfigs = this.rotorIndices.map(index => 
        EnigmaMachine.ROTORS[index] || EnigmaMachine.ROTORS[0]
      );
    }
  
    public setPlugboard(pairs: string[]): void {
      this.plugboard.clear();
      for (const pair of pairs) {
        if (pair.length === 2) {
          const [a, b] = pair.toUpperCase().split('');
          this.plugboard.set(a, b);
          this.plugboard.set(b, a);
        }
      }
    }
  
    private applyPlugboard(char: string): string {
      return this.plugboard.get(char) || char;
    }
  
    private rotateRotors(): void {
      const numRotors = this.rotorConfigs.length;
      let shouldRotateNext = false;
  
      // Double stepping mechanism
      for (let i = numRotors - 1; i >= 0; i--) {
        const currentPos = this.rotorPositions[i];
        const notchPos = this.getNotchPosition(this.rotorIndices[i]);
        
        if (i === numRotors - 1 || shouldRotateNext || currentPos === notchPos) {
          this.rotorPositions[i] = (this.rotorPositions[i] + 1) % EnigmaMachine.ALPHABET_SIZE;
          shouldRotateNext = (currentPos === notchPos);
        } else {
          shouldRotateNext = false;
        }
      }
    }
  
    private getNotchPosition(rotorIndex: number | string): number {
      const notchChar = EnigmaMachine.NOTCHES[rotorIndex] || 'A';
      return notchChar.charCodeAt(0) - 'A'.charCodeAt(0);
    }
  
    private encodeCharacter(char: string): string {
      if (!/[A-Z]/.test(char)) return char;
  
      // Step rotors before encoding
      this.rotateRotors();
  
      let charCode = char.charCodeAt(0) - 'A'.charCodeAt(0);
  
      // Apply plugboard
      char = this.applyPlugboard(char);
      charCode = char.charCodeAt(0) - 'A'.charCodeAt(0);
  
      // Forward through rotors
      for (let i = this.rotorConfigs.length - 1; i >= 0; i--) {
        const rotorPosition = this.rotorPositions[i];
        const adjustedIndex = (charCode + rotorPosition) % EnigmaMachine.ALPHABET_SIZE;
        const mappedChar = this.rotorConfigs[i][adjustedIndex];
        charCode = (mappedChar.charCodeAt(0) - 'A'.charCodeAt(0) - rotorPosition + EnigmaMachine.ALPHABET_SIZE) % EnigmaMachine.ALPHABET_SIZE;
      }
  
      // Through reflector
      const reflectedChar = this.reflector[charCode];
      charCode = reflectedChar.charCodeAt(0) - 'A'.charCodeAt(0);
  
      // Backward through rotors
      for (let i = 0; i < this.rotorConfigs.length; i++) {
        const rotorPosition = this.rotorPositions[i];
        const adjustedChar = String.fromCharCode(((charCode + rotorPosition) % EnigmaMachine.ALPHABET_SIZE) + 'A'.charCodeAt(0));
        charCode = this.rotorConfigs[i].indexOf(adjustedChar);
        charCode = (charCode - rotorPosition + EnigmaMachine.ALPHABET_SIZE) % EnigmaMachine.ALPHABET_SIZE;
      }
  
      // Apply plugboard again
      char = String.fromCharCode(charCode + 'A'.charCodeAt(0));
      return this.applyPlugboard(char);
    }
  
    public encrypt(message: string): string {
      const upperMessage = message.toUpperCase();
      return upperMessage.split('').map(char => this.encodeCharacter(char)).join('');
    }
  
    public decrypt(message: string): string {
      return this.encrypt(message);
    }
  
    public setRotorPositions(positions: number[]): void {
      this.rotorPositions = positions.slice();
    }
  
    public getRotorPositions(): number[] {
      return this.rotorPositions.slice();
    }
  
    public getRotorConfiguration(): { indices: (number | string)[], positions: number[] } {
      return {
        indices: this.rotorIndices.slice(),
        positions: this.rotorPositions.slice()
      };
    }
  
    public reset(): void {
      this.rotorPositions.fill(0);
    }
  
    public static getAvailableRotors(): (number | string)[] {
      return Object.keys(EnigmaMachine.ROTORS);
    }
  
    public static getAvailableReflectors(): string[] {
      return Object.keys(EnigmaMachine.REFLECTORS);
    }
  
    public static createFromLegacyParams(
      rotorIndicesStr: string,
      numRotors: number,
      rotations: number
    ): EnigmaMachine {
      const indices = rotorIndicesStr.split(/\s+/).map(s => parseInt(s) || 0).slice(0, numRotors);
      while (indices.length < numRotors) indices.push(0);
      
      const machine = new EnigmaMachine(indices);
      
      // Apply initial rotations 
      const positions = new Array(numRotors).fill(0);
      for (let i = 0; i < numRotors; i++) {
        positions[i] = rotations % EnigmaMachine.ALPHABET_SIZE;
      }
      machine.setRotorPositions(positions);
      
      return machine;
    }
  }
  
  export default EnigmaMachine;