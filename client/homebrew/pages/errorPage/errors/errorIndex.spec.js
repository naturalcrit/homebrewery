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

  describe('static messages', () => {

    it('returns a static string when no props are provided', () => {
      const result = errorIndex('06');

      expect(typeof result).toBe('string');
      expect(result).toContain('Unable to save Homebrewery document.');
    });

    it('uses a supplied prop when required', () => {
      const result = errorIndex('05', {
        brew: {
          accessType: 'edit',
          brewId: 'abc123'
        }
      });

      expect(result).toContain('**Requested access:** edit');
      expect(result).toContain('**Brew ID:**\tabc123');
    });

    it('throws when a required prop is not supplied', () => {
      expect(() => errorIndex('05')).toThrow();
    });

  });


  describe('escape', () => {

    it('leaves alphanumeric characters and spaces unchanged', () => {
      expect(escape('Bob Smith 123')).toBe('Bob Smith 123');
    });

    it('escapes non-alphanumeric characters', () => {
      expect(escape("O'Brien & Co.")).toBe('O&#39;Brien &#38; Co&#46;');
    });

    it('escapes characters that need HTML protection', () => {
      expect(escape('<script>')).toBe('&#60;script&#62;');
    });

  });


  describe('authorLinks', () => {

    it('returns an empty string with no array', () => {
      expect(authorLinks()).toBe('');
    });

    it('returns an empty string for an empty array', () => {
      expect(authorLinks([])).toBe('');
    });

    it('returns a link for a single author', () => {
      expect(authorLinks(['Alice'])).toBe('[Alice](/user/Alice)');
    });

    it('returns a link for a simple author', () => {
      expect(authorLinks(['Alice Smith'])).toBe(
        '[Alice Smith](/user/Alice%20Smith)'
      );
    });

    it('escapes the display name and URI-encodes the URL', () => {
      const author = "O'Brien & Co.";

      expect(authorLinks([author])).toBe(
        `[O&#39;Brien &#38; Co&#46;](/user/${encodeURIComponent(author)})`
      );
    });

    it('joins multiple authors with commas', () => {
      expect(authorLinks(['Alice', 'Bob Smith'])).toBe(
        '[Alice](/user/Alice), [Bob Smith](/user/Bob%20Smith)'
      );
    });

  });


  describe('unexpected error codes', () => {

    it('returns the switch default for an unknown error code', () => {
      const result = errorIndex('NO_SUCH_CODE');

      expect(errorIndex('NO_SUCH_CODE')).toBe(result);
      expect(errorIndex('00')).not.toBe(result);
    });

    it.each([
      -1,
      undefined,
      null,
      '',
      'NO_SUCH_CODE'
    ])('uses the switch default for %p', (errorCode) => {
      const result = errorIndex(errorCode);

      expect(result).toContain('An unexpected error occurred.');
      expect(result).toContain('we don\'t even have an error message');
      expect(result).toContain(escape(errorCode));
      expect(result).not.toBe(errorIndex('00'));
    });

    it('escapes an unexpected error code in the default message', () => {
      const result = errorIndex('<script>');
      expect(result).toContain('&#60;script&#62;');
      expect(result).not.toContain('<script>');
    });

  });


  describe('error-code types', () => {

    it('does not treat number 91 as string error code 91', () => {
      expect(errorIndex(91)).not.toBe(
        errorIndex('91')
      );
    });

    it('does not treat number 1 as string error code 01', () => {
        expect(errorIndex(1)).not.toBe(
          errorIndex('01')
        );
    });

    it('honours leading zeros', () => {
      expect(errorIndex('1')).not.toBe(
        errorIndex('01')
      );
    });

  });


  describe('defined error codes', () => {

    it('returns usable messages for all defined error codes', () => {
      // generic errors});
      let errorCodes = [ '00', '01' ];
      assertErrorMessages(errorCodes);

      // brew errors
      errorCodes = codeStrings('02', '51');
      const brewProps = {
        brew: {
          authors: [ 'Alice Smith', 'Bob Jones' ],
          account: 'Alice Smith',
          brewTitle: 'Test Brew',
          shareId: 'test-share-id',
          accessType: 'edit',
          brewId: 'test-brew-id'
        }
      };
      assertErrorMessages(errorCodes, brewProps);

      // admin errors
      errorCodes = [ '52' ];
      assertErrorMessages(errorCodes);

      // lock errors
      errorCodes = codeStrings('60', '73');
      assertErrorMessages(errorCodes);

      // other errors
      errorCodes = [ '90', '91' ];
      assertErrorMessages(errorCodes);

      // folder errors
//       errorCodes = codeStrings('100', '120');
//       const folderProps = {
//         folder: {
//           folderId: 'test-folder-id',
//           displayName: 'Test Folder'
//         }
//       };
//       assertErrorMessages(errorCodes, folderProps);
    });

  });

});
