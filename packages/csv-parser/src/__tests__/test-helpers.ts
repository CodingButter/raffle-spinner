/**
 * Test helpers for CSV parser tests
 * Provides mocks and utilities for testing in Node environment
 */

// Mock FileReaderSync for PapaParse in Node environment
if (typeof global !== 'undefined' && !global.FileReaderSync) {
  global.FileReaderSync = class FileReaderSync {
    readAsText(file: any) {
      // Extract content from our mock File
      if (file && file._content) {
        return file._content;
      }
      if (file && file.parts) {
        return file.parts.join('');
      }
      return '';
    }
  } as any;
}

// Mock File API for Node environment with better compatibility
export class MockFile {
  private _content: string;
  public name: string;
  public type: string;

  constructor(parts: any[], name: string, options?: any) {
    this._content = parts.join('');
    this.name = name;
    this.type = options?.type || 'text/csv';
    
    // Make content accessible for FileReaderSync
    (this as any).parts = parts;
  }

  async text() {
    return this._content;
  }

  get size() {
    return this._content.length;
  }
}

// Override global File if needed
if (typeof global !== 'undefined') {
  global.File = MockFile as any;
}

export function createMockFile(content: string | string[], filename: string = 'test.csv'): any {
  const contentStr = Array.isArray(content) ? content.join('\n') : content;
  return new MockFile([contentStr], filename, { type: 'text/csv' });
}