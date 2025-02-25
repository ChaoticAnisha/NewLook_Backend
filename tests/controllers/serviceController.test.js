const request = require("supertest");
const app = require("../../index");
const Service = require("../../models/Service");
const jwt = require("jsonwebtoken");

// Mock Service model
jest.mock("../../models/Service");

describe("Service Controller Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockAdminToken = jwt.sign(
    { id: 1, username: "admin", role: "admin" },
    process.env.JWT_SECRET
  );

  const mockUserToken = jwt.sign(
    { id: 2, username: "user", role: "user" },
    process.env.JWT_SECRET
  );

  describe("createService", () => {
    const mockServiceData = {
      icon: "scissors-icon",
      title: "Hair Cutting",
      description: "Professional hair cutting service",
      category: "Hair Care",
    };

    it("should successfully create a service when admin", async () => {
      Service.create.mockResolvedValue({ id: 1, ...mockServiceData });

      const response = await request(app)
        .post("/api/services")
        .set("Authorization", `Bearer ${mockAdminToken}`)
        .send(mockServiceData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.title).toBe(mockServiceData.title);
    });

    it("should deny service creation for non-admin users", async () => {
      const response = await request(app)
        .post("/api/services")
        .set("Authorization", `Bearer ${mockUserToken}`)
        .send(mockServiceData);

      expect(response.status).toBe(403);
    });
  });

  describe("getAllServices", () => {
    const mockServices = [
      {
        id: 1,
        icon: "scissors-icon",
        title: "Hair Cutting",
        description: "Professional hair cutting service",
        category: "Hair Care",
      },
      {
        id: 2,
        icon: "spa-icon",
        title: "Spa Treatment",
        description: "Relaxing spa treatment",
        category: "Spa",
      },
    ];

    it("should return all services", async () => {
      Service.findAll.mockResolvedValue(mockServices);

      const response = await request(app)
        .get("/api/services")
        .set("Authorization", `Bearer ${mockUserToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
    });
  });

  describe("getServiceById", () => {
    const mockService = {
      id: 1,
      icon: "scissors-icon",
      title: "Hair Cutting",
      description: "Professional hair cutting service",
      category: "Hair Care",
    };

    it("should return service by id", async () => {
      Service.findByPk.mockResolvedValue(mockService);

      const response = await request(app)
        .get("/api/services/1")
        .set("Authorization", `Bearer ${mockUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockService);
    });

    it("should return 404 for non-existent service", async () => {
      Service.findByPk.mockResolvedValue(null);

      const response = await request(app)
        .get("/api/services/999")
        .set("Authorization", `Bearer ${mockUserToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error", "Service not found");
    });
  });

  describe("updateService", () => {
    const mockService = {
      id: 1,
      icon: "scissors-icon",
      title: "Hair Cutting",
      description: "Professional hair cutting service",
      category: "Hair Care",
      save: jest.fn(),
    };

    const updateData = {
      title: "Updated Hair Cutting",
      description: "Updated description",
    };

    it("should successfully update service when admin", async () => {
      Service.findByPk.mockResolvedValue(mockService);

      const response = await request(app)
        .put("/api/services/1")
        .set("Authorization", `Bearer ${mockAdminToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        "message",
        "Service updated successfully"
      );
    });

    it("should deny service update for non-admin users", async () => {
      const response = await request(app)
        .put("/api/services/1")
        .set("Authorization", `Bearer ${mockUserToken}`)
        .send(updateData);

      expect(response.status).toBe(403);
    });
  });

  describe("deleteService", () => {
    const mockService = {
      id: 1,
      title: "Hair Cutting",
      destroy: jest.fn(),
    };

    it("should successfully delete service when admin", async () => {
      Service.findByPk.mockResolvedValue(mockService);

      const response = await request(app)
        .delete("/api/services/1")
        .set("Authorization", `Bearer ${mockAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        "message",
        "Service deleted successfully"
      );
    });

    it("should deny service deletion for non-admin users", async () => {
      const response = await request(app)
        .delete("/api/services/1")
        .set("Authorization", `Bearer ${mockUserToken}`);

      expect(response.status).toBe(403);
    });

    it("should return 404 for non-existent service", async () => {
      Service.findByPk.mockResolvedValue(null);

      const response = await request(app)
        .delete("/api/services/999")
        .set("Authorization", `Bearer ${mockAdminToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error", "Service not found");
    });
  });
});
