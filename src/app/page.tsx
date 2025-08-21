import React, { useState, useEffect, useCallback } from 'react';

class EnigmaMachine {
  private static readonly ALPHABET_SIZE = 26;
  
  private static readonly ROTORS: Record<string | number, string> = {
    0: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    1: "EKMFLGDQVZNTOWYHXUSPAIBRCJ",
    2: "AJDKSIRUXBLHWTMCQGZNPYFVOE",
    3: "BDFHJLCPRTXVZNYEIWGAKMUSQO",
    4: "ESOVPZJAYQUIRHXLNFTGKDCMWB",
    5: "UKLBEPXWJVFZIYGAHCMTONDRQS",
    6: "JPGVOUMFYQBENHZRDKASXLICTW",
    7: "NZJHGRCXMYSWBOUFAIVLPEKQDT",
    8: "FKQHTLXOCBJSPDZRAMEWNIUYGV",
    'I': "EKMFLGDQVZNTOWYHXUSPAIBRCJ",
    'II': "AJDKSIRUXBLHWTMCQGZNPYFVOE", 
    'III': "BDFHJLCPRTXVZNYEIWGAKMUSQO",
    'IV': "ESOVPZJAYQUIRHXLNFTGKDCMWB",
    'V': "VZBRGITYUPSDNHLXAWMJQOFECK"
  };

  private static readonly REFLECTORS: Record<string, string> = {
    'B': "YRUHQSLDPXNGOKMIEBFZCWVJAT",
    'C': "FVPJIAOYEDRZXWGCTKUQSBNMHL"
  };

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

    this.rotateRotors();
    let charCode = char.charCodeAt(0) - 'A'.charCodeAt(0);

    char = this.applyPlugboard(char);
    charCode = char.charCodeAt(0) - 'A'.charCodeAt(0);

    for (let i = this.rotorConfigs.length - 1; i >= 0; i--) {
      const rotorPosition = this.rotorPositions[i];
      const adjustedIndex = (charCode + rotorPosition) % EnigmaMachine.ALPHABET_SIZE;
      const mappedChar = this.rotorConfigs[i][adjustedIndex];
      charCode = (mappedChar.charCodeAt(0) - 'A'.charCodeAt(0) - rotorPosition + EnigmaMachine.ALPHABET_SIZE) % EnigmaMachine.ALPHABET_SIZE;
    }

    const reflectedChar = this.reflector[charCode];
    charCode = reflectedChar.charCodeAt(0) - 'A'.charCodeAt(0);

    for (let i = 0; i < this.rotorConfigs.length; i++) {
      const rotorPosition = this.rotorPositions[i];
      const adjustedChar = String.fromCharCode(((charCode + rotorPosition) % EnigmaMachine.ALPHABET_SIZE) + 'A'.charCodeAt(0));
      charCode = this.rotorConfigs[i].indexOf(adjustedChar);
      charCode = (charCode - rotorPosition + EnigmaMachine.ALPHABET_SIZE) % EnigmaMachine.ALPHABET_SIZE;
    }

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

  public static getAvailableRotors(): (number | string)[] {
    return Object.keys(EnigmaMachine.ROTORS);
  }

  public static getAvailableReflectors(): string[] {
    return Object.keys(EnigmaMachine.REFLECTORS);
  }
}

const EnigmaInterface: React.FC = () => {
  const [machine, setMachine] = useState<EnigmaMachine | null>(null);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [outputMessage, setOutputMessage] = useState<string>('');
  const [selectedRotors, setSelectedRotors] = useState<(number | string)[]>([1, 2, 3]);
  const [rotorPositions, setRotorPositions] = useState<number[]>([0, 0, 0]);
  const [reflectorType, setReflectorType] = useState<string>('B');
  const [plugboardPairs, setPlugboardPairs] = useState<string[]>([]);
  const [newPlugPair, setNewPlugPair] = useState<string>('');
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Initialize machine when settings change
  useEffect(() => {
    const newMachine = new EnigmaMachine(selectedRotors, reflectorType, rotorPositions);
    newMachine.setPlugboard(plugboardPairs);
    setMachine(newMachine);
  }, [selectedRotors, reflectorType, rotorPositions, plugboardPairs]);

  const processMessage = useCallback(() => {
    if (!machine || !inputMessage.trim()) return;
    
    setIsProcessing(true);
    
    const tempMachine = new EnigmaMachine(selectedRotors, reflectorType, rotorPositions);
    tempMachine.setPlugboard(plugboardPairs);
    
    setTimeout(() => {
      const result = mode === 'encrypt' 
        ? tempMachine.encrypt(inputMessage)
        : tempMachine.decrypt(inputMessage);
      
      setOutputMessage(result);
      setRotorPositions(tempMachine.getRotorPositions());
      setIsProcessing(false);
    }, 500);
  }, [machine, inputMessage, mode, selectedRotors, reflectorType, rotorPositions, plugboardPairs]);

  const addPlugboardPair = (): void => {
    if (newPlugPair.length === 2 && /^[A-Za-z]{2}$/.test(newPlugPair)) {
      const pair = newPlugPair.toUpperCase();
      if (!plugboardPairs.includes(pair) && !plugboardPairs.some(p => p.includes(pair[0]) || p.includes(pair[1]))) {
        setPlugboardPairs([...plugboardPairs, pair]);
        setNewPlugPair('');
      }
    }
  };

  const removePlugboardPair = (pairToRemove: string): void => {
    setPlugboardPairs(plugboardPairs.filter(pair => pair !== pairToRemove));
  };

  const resetMachine = (): void => {
    setRotorPositions([0, 0, 0]);
    setInputMessage('');
    setOutputMessage('');
    setPlugboardPairs([]);
  };

  const positionToLetter = (pos: number): string => String.fromCharCode(65 + pos);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-900 mb-2">Enigma Machine</h1>
          <p className="text-amber-700">World War II Encryption Device Simulator</p>
        </div>

        {/* Main Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Panel - Machine Configuration */}
          <div className="space-y-6">
            
            {/* Rotor Configuration */}
            <div className="bg-amber-900 rounded-lg p-6 text-white shadow-xl">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                ⚙️ Rotor Configuration
              </h2>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                {selectedRotors.map((rotor, index) => (
                  <div key={index} className="text-center">
                    <label className="block text-sm font-medium mb-1">
                      Rotor {index + 1}
                    </label>
                    <select
                      value={rotor}
                      onChange={(e) => {
                        const newRotors = [...selectedRotors];
                        const value = e.target.value;
                        newRotors[index] = isNaN(Number(value)) ? value : Number(value);
                        setSelectedRotors(newRotors);
                      }}
                      className="w-full bg-amber-800 border border-amber-600 rounded px-2 py-1 text-center"
                    >
                      {EnigmaMachine.getAvailableRotors().map(rotorId => (
                        <option key={rotorId} value={rotorId}>{rotorId}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {/* Rotor Positions */}
              <div className="grid grid-cols-3 gap-4">
                {rotorPositions.map((position, index) => (
                  <div key={index} className="text-center">
                    <label className="block text-sm font-medium mb-1">
                      Position
                    </label>
                    <div className="relative">
                      <input
                        type="range"
                        min="0"
                        max="25"
                        value={position}
                        onChange={(e) => {
                          const newPositions = [...rotorPositions];
                          newPositions[index] = parseInt(e.target.value);
                          setRotorPositions(newPositions);
                        }}
                        className="w-full"
                      />
                      <div className="text-center mt-1 font-mono text-lg">
                        {positionToLetter(position)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reflector Selection */}
            <div className="bg-amber-800 rounded-lg p-4 text-white">
              <h3 className="text-lg font-semibold mb-3">🔄 Reflector</h3>
              <select
                value={reflectorType}
                onChange={(e) => setReflectorType(e.target.value)}
                className="w-full bg-amber-700 border border-amber-600 rounded px-3 py-2"
              >
                {EnigmaMachine.getAvailableReflectors().map(reflector => (
                  <option key={reflector} value={reflector}>Type {reflector}</option>
                ))}
              </select>
            </div>

            {/* Plugboard */}
            <div className="bg-amber-800 rounded-lg p-4 text-white">
              <h3 className="text-lg font-semibold mb-3">🔌 Plugboard</h3>
              
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newPlugPair}
                  onChange={(e) => setNewPlugPair(e.target.value.toUpperCase().slice(0, 2))}
                  placeholder="AB"
                  className="flex-1 bg-amber-700 border border-amber-600 rounded px-3 py-2 text-center font-mono"
                  maxLength={2}
                />
                <button
                  onClick={addPlugboardPair}
                  className="bg-amber-600 hover:bg-amber-500 px-4 py-2 rounded font-medium transition-colors"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {plugboardPairs.map((pair, index) => (
                  <div key={index} className="bg-amber-600 rounded px-2 py-1 flex items-center gap-2 text-sm">
                    <span className="font-mono">{pair}</span>
                    <button
                      onClick={() => removePlugboardPair(pair)}
                      className="text-amber-200 hover:text-white"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - Message Processing */}
          <div className="space-y-6">
            
            {/* Mode Selection */}
            <div className="bg-white rounded-lg p-4 shadow-lg">
              <div className="flex gap-4 mb-4">
                <button
                  onClick={() => setMode('encrypt')}
                  className={`flex-1 py-2 px-4 rounded font-medium transition-colors ${
                    mode === 'encrypt' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  🔒 Encrypt
                </button>
                <button
                  onClick={() => setMode('decrypt')}
                  className={`flex-1 py-2 px-4 rounded font-medium transition-colors ${
                    mode === 'decrypt' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  🔓 Decrypt
                </button>
              </div>
            </div>

            {/* Input/Output */}
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Input Message
                  </label>
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 h-24 font-mono resize-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Enter your message here..."
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={processMessage}
                    disabled={!inputMessage.trim() || isProcessing}
                    className={`flex-1 py-3 px-6 rounded font-medium transition-colors ${
                      !inputMessage.trim() || isProcessing
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : mode === 'encrypt'
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {isProcessing ? '⚙️ Processing...' : `${mode === 'encrypt' ? '🔒 Encrypt' : '🔓 Decrypt'} Message`}
                  </button>
                  
                  <button
                    onClick={resetMachine}
                    className="px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded font-medium transition-colors"
                  >
                    Reset
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Output Message
                  </label>
                  <textarea
                    value={outputMessage}
                    readOnly
                    className="w-full border border-gray-300 rounded px-3 py-2 h-24 font-mono bg-gray-50 resize-none"
                    placeholder="Processed message will appear here..."
                  />
                </div>

                {outputMessage && (
                  <button
                    onClick={() => navigator.clipboard.writeText(outputMessage)}
                    className="w-full py-2 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded font-medium transition-colors"
                  >
                    📋 Copy to Clipboard
                  </button>
                )}
              </div>
            </div>

            {/* Machine Status */}
            <div className="bg-gray-800 rounded-lg p-4 text-white font-mono">
              <h3 className="text-lg font-semibold mb-3">📊 Machine Status</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                {rotorPositions.map((pos, index) => (
                  <div key={index}>
                    <div className="text-sm text-gray-400">Rotor {index + 1}</div>
                    <div className="text-2xl font-bold">{positionToLetter(pos)}</div>
                    <div className="text-xs text-gray-500">({selectedRotors[index]})</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="text-sm text-gray-400 mb-1">Active Plugs: {plugboardPairs.length}/10</div>
                <div className="text-xs text-gray-500">Reflector: Type {reflectorType}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-amber-700 text-sm">
          <p>Historical recreation of the WWII Enigma encryption machine</p>
          <p>Based on original C implementation with enhanced features</p>
        </div>
      </div>
    </div>
  );
};

export default EnigmaInterface;