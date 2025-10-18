// Simple File constructor polyfill for test environment
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */

// First, ensure we have a basic Blob polyfill
if (typeof globalThis.Blob === 'undefined') {
  (globalThis as any).Blob = class MockBlob {
    size: number;
    type: string;

    constructor(blobParts: any[] = [], options: any = {}) {
      this.type = options.type || '';
      this.size = 0;
    }

    arrayBuffer() {
      return Promise.resolve(new ArrayBuffer(0));
    }

    text() {
      return Promise.resolve('');
    }

    slice() {
      return new MockBlob();
    }
  };
}

// Now create File that extends Blob
if (typeof globalThis.File === 'undefined') {
  (globalThis as any).File = class MockFile extends (globalThis as any).Blob {
    name: string;
    lastModified: number;
    webkitRelativePath: string;

    constructor(fileBits: any, fileName: any, options: any = {}) {
      super(fileBits, options);
      this.name = fileName;
      this.lastModified = options.lastModified || Date.now();
      this.webkitRelativePath = '';
    }
  };
}
