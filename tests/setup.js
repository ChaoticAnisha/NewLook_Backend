process.env.JWT_SECRET = "test_jwt_secret";
process.env.NODE_ENV = "test";

global.console = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

