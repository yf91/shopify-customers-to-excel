import z from "zod";

export type ShopifyCustomer = {
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  phone: string;
  verifiedEmail: boolean;
  validEmailAddress: boolean;
  numberOfOrders: string;
  amountSpent: {
    amount: string;
    currencyCode: string;
  };
  defaultAddress: {
    address1: string;
    city: string;
    country: string;
  };
};

export type ShopifyFormState = {
  values?: z.infer<typeof shopifyFormSchema>;
  customers?: ShopifyCustomer[];
  errors: null | Partial<
    Record<keyof z.infer<typeof shopifyFormSchema>, string[]>
  >;
  success: boolean;
};

type ConnectShopFormState = {
  errors: {
    shop?: string[];
    clientId?: string[];
    clientSecret?: string[];
  };
};
