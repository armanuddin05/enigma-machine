"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { enigmaStyles } from '../../styles/enigmaStyles';

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
    <div style={enigmaStyles.container}>
      <div style={enigmaStyles.maxWidth}>
        {/* Header */}
        <div style={enigmaStyles.header}>
          <h1 style={enigmaStyles.title}>Enigma Machine</h1>
          <p style={enigmaStyles.subtitle}>World War II Encryption Device Simulator</p>
        </div>

        {/* Main Interface */}
        <div style={enigmaStyles.grid}>
          
          {/* Left Panel - Machine Configuration */}
          <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
            
            {/* Rotor Configuration */}
            <div style={enigmaStyles.panel}>
              <h2 style={enigmaStyles.sectionTitle}>
                ⚙️ Rotor Configuration
              </h2>
              
              <div style={enigmaStyles.rotorGrid}>
                {selectedRotors.map((rotor, index) => (
                  <div key={index} style={enigmaStyles.rotorItem}>
                    <label style={enigmaStyles.label}>
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
                      style={enigmaStyles.select}
                    >
                      {EnigmaMachine.getAvailableRotors().map(rotorId => (
                        <option key={rotorId} value={rotorId}>{rotorId}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {/* Rotor Positions */}
              <div style={enigmaStyles.rotorGrid}>
                {rotorPositions.map((position, index) => (
                  <div key={index} style={enigmaStyles.rotorItem}>
                    <label style={enigmaStyles.label}>
                      Position
                    </label>
                    <div>
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
                        style={enigmaStyles.slider}
                      />
                      <div style={enigmaStyles.positionDisplay}>
                        {positionToLetter(position)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reflector Selection */}
            <div style={{...enigmaStyles.panel, backgroundColor: '#92400e'}}>
              <h3 style={{...enigmaStyles.sectionTitle, fontSize: '1.125rem'}}>🔄 Reflector</h3>
              <select
                value={reflectorType}
                onChange={(e) => setReflectorType(e.target.value)}
                style={enigmaStyles.whiteSelect}
              >
                {EnigmaMachine.getAvailableReflectors().map(reflector => (
                  <option key={reflector} value={reflector}>Type {reflector}</option>
                ))}
              </select>
            </div>

            {/* Plugboard */}
            <div style={{...enigmaStyles.panel, backgroundColor: '#92400e'}}>
              <h3 style={{...enigmaStyles.sectionTitle, fontSize: '1.125rem'}}>🔌 Plugboard</h3>
              
              <div style={enigmaStyles.plugRow}>
                <input
                  type="text"
                  value={newPlugPair}
                  onChange={(e) => setNewPlugPair(e.target.value.toUpperCase().slice(0, 2))}
                  placeholder="AB"
                  style={enigmaStyles.plugInput}
                  maxLength={2}
                />
                <button
                  onClick={addPlugboardPair}
                  style={enigmaStyles.addButton}
                >
                  Add
                </button>
              </div>

              <div style={enigmaStyles.plugChips}>
                {plugboardPairs.map((pair, index) => (
                  <div key={index} style={enigmaStyles.plugChip}>
                    <span style={{fontFamily: 'monospace'}}>{pair}</span>
                    <button
                      onClick={() => removePlugboardPair(pair)}
                      style={enigmaStyles.removeButton}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - Message Processing */}
          <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
            
            {/* Mode Selection */}
            <div style={enigmaStyles.whitePanel}>
              <div style={enigmaStyles.modeButtons}>
                <button
                  onClick={() => setMode('encrypt')}
                  style={enigmaStyles.modeButton(mode === 'encrypt')}
                >
                  🔒 Encrypt
                </button>
                <button
                  onClick={() => setMode('decrypt')}
                  style={enigmaStyles.modeButton(mode === 'decrypt')}
                >
                  🔓 Decrypt
                </button>
              </div>
            </div>

            {/* Input/Output */}
            <div style={enigmaStyles.whitePanel}>
              <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                <div>
                  <label style={{...enigmaStyles.label, color: '#374151', marginBottom: '8px'}}>
                    Input Message
                  </label>
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    style={enigmaStyles.textarea}
                    placeholder="Enter your message here..."
                  />
                </div>

                <div style={enigmaStyles.buttonRow}>
                  <button
                    onClick={processMessage}
                    disabled={!inputMessage.trim() || isProcessing}
                    style={enigmaStyles.processButton(!inputMessage.trim() || isProcessing)}
                  >
                    {isProcessing ? '⚙️ Processing...' : `${mode === 'encrypt' ? '🔒 Encrypt' : '🔓 Decrypt'} Message`}
                  </button>
                  
                  <button
                    onClick={resetMachine}
                    style={enigmaStyles.resetButton}
                  >
                    Reset
                  </button>
                </div>

                <div>
                  <label style={{...enigmaStyles.label, color: '#374151', marginBottom: '8px'}}>
                    Output Message
                  </label>
                  <textarea
                    value={outputMessage}
                    readOnly
                    style={enigmaStyles.readOnlyTextarea}
                    placeholder="Processed message will appear here..."
                  />
                </div>

                {outputMessage && (
                  <button
                    onClick={() => navigator.clipboard.writeText(outputMessage)}
                    style={enigmaStyles.copyButton}
                  >
                    📋 Copy to Clipboard
                  </button>
                )}
              </div>
            </div>

            {/* Machine Status */}
            <div style={enigmaStyles.statusPanel}>
              <h3 style={{...enigmaStyles.sectionTitle, marginBottom: '12px'}}>📊 Machine Status</h3>
              <div style={enigmaStyles.statusGrid}>
                {rotorPositions.map((pos, index) => (
                  <div key={index} style={enigmaStyles.statusItem}>
                    <div style={enigmaStyles.statusLabel}>Rotor {index + 1}</div>
                    <div style={enigmaStyles.statusValue}>{positionToLetter(pos)}</div>
                    <div style={enigmaStyles.statusSmall}>({selectedRotors[index]})</div>
                  </div>
                ))}
              </div>
              <div style={enigmaStyles.statusFooter}>
                <div style={{...enigmaStyles.statusSmall, marginBottom: '4px'}}>Active Plugs: {plugboardPairs.length}/10</div>
                <div style={enigmaStyles.statusSmall}>Reflector: Type {reflectorType}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={enigmaStyles.footer}>
          <p>Historical recreation of the WWII Enigma encryption machine</p>
        </div>
      </div>
    </div>
  );
};

export default EnigmaInterface;