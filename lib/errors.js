class InvalidProblemIdError extends Error {
  constructor() {
    super();
    this.code = 1054;
    this.message = 'Invalid problem id';
    this.status = 400;
  }
}

class InvalidMatchUsersError extends Error {
  constructor() {
    super();
    this.code = 1055;
    this.message = 'Invalid match users';
    this.status = 400;
  }
}

class InvalidWinnerIdError extends Error {
  constructor() {
    super();
    this.code = 1056;
    this.message = 'Invalid winner id';
    this.status = 400;
  }
}

class InvalidMatchIdError extends Error {
  constructor() {
    super();
    this.code = 1057;
    this.message = 'Invalid match id';
    this.status = 400;
  }
}

class InvalidCreatedUserError extends Error {
  constructor() {
    super();
    this.code = 1058;
    this.message = 'Invalid created user';
    this.status = 400;
  }
}

class InvalidDescriptionError extends Error {
  constructor() {
    super();
    this.code = 1059;
    this.message = 'Invalid description';
    this.status = 400;
  }
}

class InvalidTitleError extends Error {
  constructor() {
    super();
    this.code = 1060;
    this.message = 'Invalid title';
    this.status = 400;
  }
}

class InvalidInitialCodeError extends Error {
  constructor() {
    super();
    this.code = 1061;
    this.message = 'Invalid initial code';
    this.status = 400;
  }
}

class InvalidDifficultyLevelError extends Error {
  constructor() {
    super();
    this.code = 1062;
    this.message = 'Invalid difficulty level';
    this.status = 400;
  }
}

class InvalidTestCaseError extends Error {
  constructor() {
    super();
    this.code = 1063;
    this.message = 'Invalid test case';
    this.status = 400;
  }
}

class InvalidUserIdError extends Error {
  constructor() {
    super();
    this.code = 1064;
    this.message = 'Invalid user id';
    this.status = 400;
  }
}

class DuplicateObjectIdError extends Error {
  constructor() {
    super();
    this.code = 1065;
    this.message = 'Invalid query params';
    this.status = 400;
  }
}

class InvalidImageUrlError extends Error {
  constructor() {
    super();
    this.code = 1066;
    this.message = 'Invalid Image Url';
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
  DuplicateObjectIdError,
  InvalidTestCaseError,
  InvalidDifficultyLevelError,
  InvalidInitialCodeError,
  InvalidDescriptionError,
  InvalidTitleError,
  InvalidCreatedUserError,
  InvalidMatchIdError,
  InvalidWinnerIdError,
  InvalidMatchUsersError,
  InvalidUserIdError,
  InvalidProblemIdError,
  InvalidImageUrlError,
};

module.exports = ERRORS;
