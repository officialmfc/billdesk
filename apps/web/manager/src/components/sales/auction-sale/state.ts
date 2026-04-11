export interface SaleState {
  chalanDate: string;
  sellerName: string;
  sellerId: string | null;
  commissionPercentage: number;
  paidAmount: number;
  saleItems: SaleItem[];
  saving: boolean;
}

export type SaleItem = {
  id: string;
  buyerName: string;
  buyerId: string | null;
  productDescription: string;
  weight: number;
  rate: number;
  total: number;
};

export type Action =
  | { type: "SET_SELLER"; name: string; id: string | null }
  | { type: "SET_COMMISSION_PERCENTAGE"; percentage: number }
  | { type: "SET_PAID_AMOUNT"; amount: number }
  | { type: "ADD_SALE_ITEM"; prefillProduct?: string }
  | { type: "ADD_SALE_ITEM_AFTER"; afterId: string }
  | { type: "REMOVE_SALE_ITEM"; id: string }
  | {
      type: "UPDATE_SALE_ITEM";
      id: string;
      field: keyof SaleItem;
      value: string | number | null;
    }
  | { type: "SET_SAVING"; saving: boolean }
  | { type: "RESET_FORM" };

export const initialState: SaleState = {
  chalanDate: new Date().toISOString().split("T")[0] ?? "",
  sellerName: "",
  sellerId: null,
  commissionPercentage: 6,
  paidAmount: 0,
  saleItems: [],
  saving: false,
};

export function saleReducer(state: SaleState, action: Action): SaleState {
  switch (action.type) {
    case "SET_SELLER":
      return { ...state, sellerName: action.name, sellerId: action.id };
    case "SET_COMMISSION_PERCENTAGE":
      return { ...state, commissionPercentage: action.percentage };
    case "SET_PAID_AMOUNT":
      return { ...state, paidAmount: action.amount };
    case "ADD_SALE_ITEM":
      const newItem: SaleItem = {
        id: crypto.randomUUID(),
        buyerName: "",
        buyerId: null,
        productDescription: action.prefillProduct || "",
        weight: 0,
        rate: 0,
        total: 0,
      };
      return { ...state, saleItems: [...state.saleItems, newItem] };
    case "ADD_SALE_ITEM_AFTER": {
      const newItems = [...state.saleItems];
      const currentIndex = newItems.findIndex(
        (item) => item.id === action.afterId
      );
      const currentItem =
        currentIndex !== -1 ? newItems[currentIndex] : undefined;

      const newItemAfter: SaleItem = {
        id: crypto.randomUUID(),
        buyerName: "",
        buyerId: null,
        productDescription: currentItem?.productDescription || "",
        weight: 0,
        rate: 0,
        total: 0,
      };

      if (currentIndex !== -1) {
        newItems.splice(currentIndex + 1, 0, newItemAfter);
      } else {
        newItems.push(newItemAfter);
      }
      return { ...state, saleItems: newItems };
    }
    case "REMOVE_SALE_ITEM":
      return {
        ...state,
        saleItems: state.saleItems.filter((item) => item.id !== action.id),
      };
    case "UPDATE_SALE_ITEM":
      return {
        ...state,
        saleItems: state.saleItems.map((item) => {
          if (item.id !== action.id) return item;
          const updated = { ...item, [action.field]: action.value };
          if (action.field === "weight" || action.field === "rate") {
            updated.total = updated.weight * updated.rate;
          }
          return updated;
        }),
      };
    case "SET_SAVING":
      return { ...state, saving: action.saving };
    case "RESET_FORM":
      return {
        ...initialState,
        chalanDate: new Date().toISOString().split("T")[0] ?? "",
      };
    default:
      return state;
  }
}
