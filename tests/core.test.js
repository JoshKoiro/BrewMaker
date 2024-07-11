// __tests__/core.test.js

const fs = require('fs');
const path = require('path');

// Mock the DOM environment
document.body.innerHTML = fs.readFileSync(path.resolve(__dirname, '../brewMaker.html'), 'utf8');

// Import the functions to test
const { createGroup, createField, formatFieldName } = require('../js/core');

describe('Core functionality', () => {
  test('createGroup adds a new group to the DOM', () => {
    const initialGroupCount = document.querySelectorAll('#groups .card').length;
    createGroup();
    const newGroupCount = document.querySelectorAll('#groups .card').length;
    expect(newGroupCount).toBe(initialGroupCount + 1);
  });

  test('createField adds a new field to a group', () => {
    const group = document.querySelector('#groups .card');
    const initialFieldCount = group.querySelectorAll('tbody tr').length;
    createField(group);
    const newFieldCount = group.querySelectorAll('tbody tr').length;
    expect(newFieldCount).toBe(initialFieldCount + 1);
  });

  test('formatFieldName correctly formats field names', () => {
    expect(formatFieldName('Test Field')).toBe('Test Field');
    expect(formatFieldName('another_test')).toBe('another_test');
  });
});

// __tests__/conditions.test.js

const { addCondition, getConditionsConfig } = require('../js/conditions');

describe('Conditions functionality', () => {
  test('addCondition creates a new condition element', () => {
    const initialConditionCount = document.querySelectorAll('#conditions .card').length;
    addCondition();
    const newConditionCount = document.querySelectorAll('#conditions .card').length;
    expect(newConditionCount).toBe(initialConditionCount + 1);
  });

  test('getConditionsConfig returns the correct structure', () => {
    addCondition('Test Condition');
    const config = getConditionsConfig();
    expect(config).toBeInstanceOf(Array);
    expect(config[0]).toHaveProperty('name', 'Test Condition');
    expect(config[0]).toHaveProperty('if');
    expect(config[0]).toHaveProperty('then');
  });
});

// Add more test files for other modules as needed