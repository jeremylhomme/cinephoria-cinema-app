import { PrismaClient } from "@prisma/client";
import { asyncHandler } from "../middlewares/asyncHandler.js";

const prisma = new PrismaClient();

const createCategory = asyncHandler(async (req, res, prisma) => {
  const { categoryName } = req.body;
  const existingCategory = await prisma.category.findUnique({
    where: { categoryName },
  });

  if (existingCategory) {
    return res.status(400).json({ message: "Category already exists." });
  }

  const category = await prisma.category.create({ data: { categoryName } });
  res.status(201).json(category);
});

const getCategories = asyncHandler(async (req, res, prisma) => {
  const categories = await prisma.category.findMany({
    include: { movies: true },
  });
  res.status(200).json(categories);
});

const getCategory = asyncHandler(async (req, res, prisma) => {
  const { id } = req.params;

  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) {
    return res.status(400).json({ message: "Invalid category ID provided." });
  }

  try {
    const category = await prisma.category.findUnique({
      where: { id: numericId },
      include: { movies: true },
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json(category);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving category", error: error.message });
  }
});

const updateCategory = asyncHandler(async (req, res, prisma) => {
  const { id } = req.params;
  const { categoryName } = req.body;
  const category = await prisma.category.findUnique({
    where: { id: Number(id) },
  });

  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  const updatedCategory = await prisma.category.update({
    where: { id: Number(id) },
    data: { categoryName },
  });
  res.status(200).json(updatedCategory);
});

const deleteCategory = asyncHandler(async (req, res, prisma) => {
  const { id } = req.params;
  const category = await prisma.category.delete({ where: { id: Number(id) } });
  res.status(200).json({ message: "Category deleted successfully" });
});

export {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
};
