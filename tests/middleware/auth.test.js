const jwt = require("jsonwebtoken");
const auth = require("../../middleware/auth");

jest.mock("jsonwebtoken");

describe("Auth Middleware", () => {
  let mockReq;
  let mockRes;
  let nextFunction;

  beforeEach(() => {
    mockReq = {
      header: jest.fn(),
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
    jest.clearAllMocks();
  });

  it("should pass with valid token", async () => {
    const mockUser = { id: 1, username: "test" };
    const token = "valid.token.here";
    mockReq.header.mockReturnValue(`Bearer ${token}`);
    jwt.verify.mockReturnValue(mockUser);

    await auth(mockReq, mockRes, nextFunction);

    expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET);
    expect(nextFunction).toHaveBeenCalled();
    expect(mockReq.user).toEqual(mockUser);
  });

  it("should fail without token", async () => {
    mockReq.header.mockReturnValue(undefined);

    await auth(mockReq, mockRes, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Authentication required",
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should fail with invalid token format", async () => {
    mockReq.header.mockReturnValue("InvalidFormat");

    await auth(mockReq, mockRes, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Authentication required",
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should fail with invalid token", async () => {
    mockReq.header.mockReturnValue("Bearer invalid.token.here");
    jwt.verify.mockImplementation(() => {
      throw new jwt.JsonWebTokenError("Invalid token");
    });

    await auth(mockReq, mockRes, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Invalid token" });
    expect(nextFunction).not.toHaveBeenCalled();
  });
});
