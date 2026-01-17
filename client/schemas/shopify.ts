import z from "zod";

export const shopifyFormSchema = z.object({
  shop: z.string().min(1, "Shop is required"),
  clientId: z.string().min(1, "Client ID is required"),
  clientSecret: z.string().min(1, "Client Secret is required"),
});
