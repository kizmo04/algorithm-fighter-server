class EmailNotFoundError extends Error {
  constructor() {
    super();
    this.code = 1066;
    this.message = 'email required';
    this.status = 400;
  }
}

class InvalidEmailError extends Error {
  constructor() {
    super();
    this.code = 1067;
    this.message = 'Invalid Email Format';
    this.status = 400;
  }
}

class InvalidPasswordError extends Error {
  constructor() {
    super();
    this.code = 1068;
    this.message = 'Invalid Password Format';
    this.status = 400;
  }
}

class DuplicateEmailError extends Error {
  constructor() {
    super();
    this.code = 1069;
    this.message = 'Duplicate Email Error';
    this.status = 400;
  }
}

class ServerError extends Error {
  constructor() {
    super();
    this.code = 1070;
    this.message = 'Server Error';
    this.status = 500;
  }
}

class AuthenticationError extends Error {
  constructor() {
    super();
    this.code = 1071;
    this.message = 'Authentication Error - Token Invalid';
    this.status = 400;
  }
}

class TokenExpiredError extends Error {
  constructor() {
    super();
    this.code = 1072;
    this.message = 'Authentication Error - JWT expired';
    this.status = 400;
  }
}

const ERRORS = {
  InvalidEmailError,
  InvalidPasswordError,
  DuplicateEmailError,
  ServerError,
  AuthenticationError,
  TokenExpiredError,
  EmailNotFoundError
};

module.exports = ERRORS;
