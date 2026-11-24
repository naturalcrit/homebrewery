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

// tests..
describe('errorIndex', () => {

  describe('static messages', () => {
    const staticErrorCodes = expandRanges('00-01,06,10,13,50,52,60-73,90-91');

    it.each(staticErrorCodes)
      ('returns a static string when no props are provided for %p', (errorCode) => {
        const result = errorIndex(errorCode);
        expect(typeof result).toBe('string');
      });

    it.each(staticErrorCodes)
      ('ignores props if provided for %p', (errorCode) => {
        const props = {
          brew: {
            accessType: 'edit',
            brewId: 'abc123'
          }
        };

        const result_no_props = errorIndex(errorCode);
        const result_props = errorIndex(errorCode, { props });

        expect(result_props).toBe(result_no_props);
      });
    });


  describe('dynamic messages', () => {
    const dynamicErrorCodes = expandRanges('02-05,07-09,11-12,51');

    it.each(dynamicErrorCodes)
      ('throws when a required prop is not supplied for %p', (errorCode) => {
        expect(() => errorIndex(errorCode)).toThrow();
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

  });


  describe('escape helper', () => {

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


  describe('authorLinks helper', () => {

    it('returns a link for a single author', () => {
      expect(authorLinks(['Alice'])).toBe('[Alice](/user/Alice)');
    });

    it('joins multiple authors with commas', () => {
      expect(authorLinks(['Alice', 'Bob Smith'])).toBe(
        '[Alice](/user/Alice), [Bob Smith](/user/Bob%20Smith)'
      );
    });

    it('returns an empty string with no array', () => {
      expect(authorLinks()).toBe('');
    });

    it('returns an empty string for an empty array', () => {
      expect(authorLinks([])).toBe('');
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

  });


  describe('unexpected error codes', () => {

    it('returns the unknown error for an unknown error code', () => {
      const result = errorIndex('NO_SUCH_CODE');
      expect(result).toContain('An unexpected error occurred.');
      expect(result).toContain('we don\'t even have an error message');
      expect(result).toContain(escape('NO_SUCH_CODE'));
    });

    it.each([-1,undefined,null,[],{}])
      ('throws if error code %p is not a string', (errorCode) => {
        expect(() => errorIndex(errorCode)).toThrow();
      });

    it('escapes an unexpected error code in the default message', () => {
      const result = errorIndex('<script>');
      expect(result).toContain('&#60;script&#62;');
      expect(result).not.toContain('<script>');
    });

  });

});
