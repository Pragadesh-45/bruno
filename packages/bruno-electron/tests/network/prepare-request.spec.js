const { describe, it, expect } = require('@jest/globals');

const prepareRequest = require('../../src/ipc/network/prepare-request');

describe('prepare-request: prepareRequest', () => {
  describe('Decomments request body', () => {
    it('If request body is valid JSON', async () => {
      const body = { mode: 'json', json: '{\n"test": "{{someVar}}" // comment\n}' };
      const expected = '{\n"test": "{{someVar}}" \n}';
      const result = prepareRequest({ request: { body } }, {});
      expect(result.data).toEqual(expected);
    });

    it('If request body is not valid JSON', async () => {
      const body = { mode: 'json', json: '{\n"test": {{someVar}} // comment\n}' };
      const expected = '{\n"test": {{someVar}} \n}';
      const result = prepareRequest({ request: { body } }, {});
      expect(result.data).toEqual(expected);
    });
  });
});
