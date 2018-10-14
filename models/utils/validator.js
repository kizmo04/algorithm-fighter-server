module.exports = {
  validateString(str) {
    return typeof str === 'string' && !!str.trim();
  },
  validateTestCase(tests) {
    return tests.every(test => {
      return typeof test.input === 'string' && typeof test.expected_output === 'string';
    });
  }
};

