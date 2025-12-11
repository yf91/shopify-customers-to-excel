import z from "zod";

export const shopifyFormSchema = z.object({
  shop: z.string().min(1, "Shop is required"),
  apiKey: z.string().min(1, "API Key is required"),
});
