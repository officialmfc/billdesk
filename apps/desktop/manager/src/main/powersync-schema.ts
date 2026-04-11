import { column, Schema, Table } from "@powersync/node";

const mfc_staff = new Table({
  full_name: column.text,
  role: column.text,
  is_active: column.integer,
  is_default_admin: column.integer,
  created_at: column.text,
  updated_at: column.text,
  created_by: column.text,
  updated_by: column.text,
});

const users = new Table({
  auth_user_id: column.text,
  name: column.text,
  business_name: column.text,
  phone: column.text,
  user_type: column.text,
  default_role: column.text,
  is_active: column.integer,
  address: column.text,
  profile_photo_url: column.text,
  created_at: column.text,
  updated_at: column.text,
  created_by: column.text,
  updated_by: column.text,
});

const products = new Table({
  name: column.text,
  description: column.text,
  is_stock_tracked: column.integer,
  created_at: column.text,
  updated_at: column.text,
  created_by: column.text,
  updated_by: column.text,
});

const stock_batches = new Table({
  product_id: column.text,
  batch_code: column.text,
  supplier_id: column.text,
  initial_weight_kg: column.real,
  current_weight_kg: column.real,
  cost_per_kg: column.real,
  created_at: column.text,
  updated_at: column.text,
  created_by: column.text,
  updated_by: column.text,
  mfc_seller_id: column.text,
});

const daily_bills = new Table({
  bill_number: column.text,
  customer_id: column.text,
  bill_date: column.text,
  total_amount: column.real,
  amount_paid: column.real,
  status: column.text,
  created_at: column.text,
  updated_at: column.text,
  created_by: column.text,
  updated_by: column.text,
  is_migration_bill: column.integer,
});

const chalans = new Table({
  chalan_number: column.text,
  seller_id: column.text,
  mfc_seller_id: column.text,
  chalan_date: column.text,
  total_sale_value: column.real,
  commission_rate_percent: column.real,
  commission_amount: column.real,
  net_payable: column.real,
  amount_paid: column.real,
  status: column.text,
  created_at: column.text,
  updated_at: column.text,
  created_by: column.text,
  updated_by: column.text,
});

const sale_transactions = new Table({
  daily_bill_id: column.text,
  stock_batch_id: column.text,
  chalan_id: column.text,
  product_id: column.text,
  product_description: column.text,
  weight_kg: column.real,
  price_per_kg: column.real,
  amount: column.real,
  created_at: column.text,
  updated_at: column.text,
  created_by: column.text,
  updated_by: column.text,
  sale_type: column.text,
});

const customer_payments = new Table({
  daily_bill_id: column.text,
  payment_date: column.text,
  amount: column.real,
  payment_method: column.text,
  created_at: column.text,
  updated_at: column.text,
  created_by: column.text,
  updated_by: column.text,
});

const seller_payments = new Table({
  chalan_id: column.text,
  payment_date: column.text,
  amount: column.real,
  payment_method: column.text,
  created_at: column.text,
  updated_at: column.text,
  created_by: column.text,
  updated_by: column.text,
});

const manager_spendings = new Table({
  spent_date: column.text,
  title: column.text,
  category: column.text,
  amount: column.real,
  note: column.text,
  payment_method: column.text,
  created_at: column.text,
  updated_at: column.text,
  created_by: column.text,
  updated_by: column.text,
});

const quotes = new Table({
  quote_number: column.text,
  customer_id: column.text,
  assigned_mfc_seller_id: column.text,
  delivery_date: column.text,
  total_amount: column.real,
  advance_paid: column.real,
  status: column.text,
  notes: column.text,
  created_at: column.text,
  updated_at: column.text,
  created_by: column.text,
  updated_by: column.text,
});

const quote_items = new Table({
  quote_id: column.text,
  product_id: column.text,
  product_description: column.text,
  weight_kg: column.real,
  price_per_kg: column.real,
  line_total: column.real,
});

const customer_balance = new Table({
  user_id: column.text,
  total_billed: column.real,
  total_paid: column.real,
  current_due: column.real,
  updated_at: column.text,
});

const seller_balance = new Table({
  user_id: column.text,
  total_earned: column.real,
  total_paid_out: column.real,
  current_due: column.real,
  updated_at: column.text,
});

const system_config = new Table({
  default_admin_id: column.text,
  mfc_stock_buyer_id: column.text,
});

export const powerSyncSchema = new Schema({
  mfc_staff,
  users,
  products,
  stock_batches,
  daily_bills,
  chalans,
  sale_transactions,
  customer_payments,
  seller_payments,
  manager_spendings,
  quotes,
  quote_items,
  customer_balance,
  seller_balance,
  system_config,
});
