import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} from "../../backend/controllers/categoryController.js";

// Mock Prisma
const mockPrisma = {
  category: {
    findUnique: vi.fn(),
    create: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

describe("Category Controller", () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = { body: {}, params: {} };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    vi.clearAllMocks();
  });

  describe("createCategory", () => {
    it("should create a new category", async () => {
      mockReq.body = { categoryName: "Action" };
      mockPrisma.category.findUnique.mockResolvedValue(null);
      mockPrisma.category.create.mockResolvedValue({
        id: 1,
        categoryName: "Action",
      });

      await createCategory(mockReq, mockRes, mockPrisma);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        id: 1,
        categoryName: "Action",
      });
    });

    it("should return 400 if category already exists", async () => {
      mockReq.body = { categoryName: "Action" };
      mockPrisma.category.findUnique.mockResolvedValue({
        id: 1,
        categoryName: "Action",
      });

      await createCategory(mockReq, mockRes, mockPrisma);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Category already exists.",
      });
    });
  });

  describe("getCategories", () => {
    it("should return all categories", async () => {
      const mockCategories = [
        { id: 1, categoryName: "Action", movies: [] },
        { id: 2, categoryName: "Comedy", movies: [] },
      ];
      mockPrisma.category.findMany.mockResolvedValue(mockCategories);

      await getCategories(mockReq, mockRes, mockPrisma);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockCategories);
    });
  });

  describe("getCategory", () => {
    it("should return a specific category", async () => {
      mockReq.params = { id: "1" };
      const mockCategory = { id: 1, categoryName: "Action", movies: [] };
      mockPrisma.category.findUnique.mockResolvedValue(mockCategory);

      await getCategory(mockReq, mockRes, mockPrisma);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockCategory);
    });

    it("should return 404 if category not found", async () => {
      mockReq.params = { id: "999" };
      mockPrisma.category.findUnique.mockResolvedValue(null);

      await getCategory(mockReq, mockRes, mockPrisma);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Category not found",
      });
    });

    it("should return 400 if invalid id provided", async () => {
      mockReq.params = { id: "invalid" };

      await getCategory(mockReq, mockRes, mockPrisma);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Invalid category ID provided.",
      });
    });
  });

  describe("updateCategory", () => {
    it("should update a category", async () => {
      mockReq.params = { id: "1" };
      mockReq.body = { categoryName: "Updated Action" };
      mockPrisma.category.findUnique.mockResolvedValue({
        id: 1,
        categoryName: "Action",
      });
      mockPrisma.category.update.mockResolvedValue({
        id: 1,
        categoryName: "Updated Action",
      });

      await updateCategory(mockReq, mockRes, mockPrisma);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        id: 1,
        categoryName: "Updated Action",
      });
    });

    it("should return 404 if category not found", async () => {
      mockReq.params = { id: "999" };
      mockReq.body = { categoryName: "Updated Action" };
      mockPrisma.category.findUnique.mockResolvedValue(null);

      await updateCategory(mockReq, mockRes, mockPrisma);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Category not found",
      });
    });
  });

  describe("deleteCategory", () => {
    it("should delete a category", async () => {
      mockReq.params = { id: "1" };
      mockPrisma.category.delete.mockResolvedValue({
        id: 1,
        categoryName: "Action",
      });

      await deleteCategory(mockReq, mockRes, mockPrisma);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Category deleted successfully",
      });
    });
  });
});
