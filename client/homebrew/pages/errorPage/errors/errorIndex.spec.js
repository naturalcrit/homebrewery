// /client/homebrew/pages/errorPage/errors/errorIndex.spec.js

import errorIndex, { escape, authorLinks } from './errorIndex.js';


// helpers..
const codeStrings = (from, to, width = String(to).length) => {
  const values = [];
  for (let i = Number(from); i <= Number(to); i++) {
    values.push(String(i).padStart(width, '0'));
  }
  return values;
};

const expandRanges = (input) => {
  // console.log(expandRanges('1-5,08-11,98-101'));
  // ['1', '2', '3', '4', '5', '08', '09', '10', '11', '98', '99', '100', '101']
  return input.split(',').flatMap(part => {
    const [start, end] = part.split('-').map(Number);
    const pad = part.split('-')[0].length > 1
      ? part.split('-')[0].length
      : 0;

    return Array.from(
      { length: end - start + 1 },
      (_, i) => String(start + i).padStart(pad, '0')
    );
  });
};

const assertErrorMessages = (errorCodes, props = {}) => {
  const defaultResult = errorIndex('NO_SUCH_ERROR');
  errorCodes.forEach((errorCode) => {
    let result;

    expect(() => {
      result = errorIndex(errorCode, props);
    }).not.toThrow();

    expect(typeof result).toBe('string');
    expect(result).not.toBe(defaultResult);
    expect(result.length).toBeGreaterThan(0);
  });
};


// tests..
describe('errorIndex', () => {


});
