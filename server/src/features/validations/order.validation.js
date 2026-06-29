import { z } from "zod";

// Create Order
export const createOrderSchema = z.object({
  orderId: z
    .string()
    .trim()
    .min(1, "Order ID is required"),

  customerName: z
    .string()
    .trim()
    .min(2, "Customer name must be at least 2 characters")
    .max(100, "Customer name is too long"),

  productName: z
    .string()
    .trim()
    .min(2, "Product name must be at least 2 characters")
    .max(150, "Product name is too long"),

  quantity: z
    .number()
    .int("Quantity must be an integer")
    .positive("Quantity must be greater than 0"),

  price: z
    .number()
    .positive("Price must be greater than 0"),

  region: z
    .string()
    .trim()
    .min(2, "Region is required"),

  orderDate: z.coerce.date(),

  status: z
    .enum([
      "Completed",
      "Pending",
      "Cancelled",
      "Shipped",
      "Delivered",
    ])
    .optional(),

  uploadId: z.string().optional(),

  userId: z.string().optional(),
});

// Update Order
export const updateOrderSchema = createOrderSchema.partial();

// Upload Order (CSV/Excel)
export const uploadOrderSchema = z.array(createOrderSchema);