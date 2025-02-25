const roleAuth = require("../../middleware/roleAuth");

describe("Role Authorization Middleware", () => {
  let mockReq;
  let mockRes;
  let nextFunction;

  beforeEach(() => {
    mockReq = {
      user: {
        role: "",
      },
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  it("should allow access for correct role", () => {
    mockReq.user.role = "admin";
    const middleware = roleAuth(["admin"]);

    middleware(mockReq, mockRes, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it("should allow access for multiple allowed roles", () => {
    mockReq.user.role = "user";
    const middleware = roleAuth(["admin", "user"]);

    middleware(mockReq, mockRes, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it("should deny access for incorrect role", () => {
    mockReq.user.role = "user";
    const middleware = roleAuth(["admin"]);

    middleware(mockReq, mockRes, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Access forbidden" });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should deny access when no user role is provided", () => {
    mockReq.user = { role: undefined };
    const middleware = roleAuth(["admin"]);

    middleware(mockReq, mockRes, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Access forbidden" });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should deny access when user object is not present", () => {
    mockReq.user = null;
    const middleware = roleAuth(["admin"]);

    middleware(mockReq, mockRes, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Access forbidden" });
    expect(nextFunction).not.toHaveBeenCalled();
  });
});
