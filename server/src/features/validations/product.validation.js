import { z } from "zod";
export const createProductSchema = z.object({
  productId: z
    .string()
    .trim()
    .min(1, "Product ID is required"),

  productName: z
    .string()
    .trim()
    .min(2, "Product name must be at least 2 characters")
    .max(100, "Product name is too long"),

  category: z
    .string()
    .trim()
    .min(2, "Category is required"),

  brand: z
    .string()
    .trim()
    .min(2, "Brand is required"),

  price: z
    .number()
    .positive("Price must be greater than 0"),

  costPrice: z
    .number()
    .nonnegative("Cost price cannot be negative"),

  stock: z
    .number()
    .int("Stock must be an integer")
    .nonnegative("Stock cannot be negative"),

  soldUnits: z
    .number()
    .int("Sold units must be an integer")
    .nonnegative("Sold units cannot be negative"),

  rating: z
    .number()
    .min(0, "Rating cannot be less than 0")
    .max(5, "Rating cannot be greater than 5"),

  region: z
    .string()
    .trim()
    .min(2, "Region is required"),

  colors: z
    .array(z.string())
    .optional(),

  sizes: z
    .array(z.string())
    .optional(),

  dateAdded: z
    .coerce
    .date()
    .optional(),

  customFields: z
    .record(z.any())
    .optional(),

  uploadId: z
    .string()
    .optional(),

  userId: z
    .string()
    .optional(),
});

// Update Product
export const updateProductSchema =
  createProductSchema.partial();

// Bulk Upload Validation (Excel / CSV)
export const uploadProductSchema =
  z.array(createProductSchema);