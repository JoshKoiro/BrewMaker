global.window = {
    version: '0.2.0',
    majorVersion: 0,
    minorVersion: 2,
    patchVersion: 0,
  };
  
  // Mock other global functions or objects as needed
  global.createGroup = jest.fn();
  global.createField = jest.fn();
  // ... other global functions
  
  // If you're using any DOM methods in your tests, you might need to mock them here
  global.document.createElement = jest.fn();
  global.document.querySelector = jest.fn();
  global.document.querySelectorAll = jest.fn();