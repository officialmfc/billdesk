export type BusinessPrintConfig = {
  address: string;
  email: string;
  gst: string;
  name: string;
  phone: string;
};

export function getBusinessPrintConfig(): BusinessPrintConfig {
  return {
    address: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS || "",
    email: process.env.NEXT_PUBLIC_BUSINESS_EMAIL || "",
    gst: process.env.NEXT_PUBLIC_BUSINESS_GST || "",
    name: process.env.NEXT_PUBLIC_BUSINESS_NAME || "Mondal Fish Center",
    phone: process.env.NEXT_PUBLIC_BUSINESS_PHONE || "",
  };
}
