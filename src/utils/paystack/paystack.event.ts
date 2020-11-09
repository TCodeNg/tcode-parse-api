import { EVENTS } from "./event.enum";

export interface PaystackEvent {
  event: EVENTS;
  data: Data;
}

export interface Data {
  id?: number;
  domain: string;
  status: string;
  reference?: string;
  amount: number;
  message: any;
  gateway_response?: string;
  paid_at?: string;
  created_at: string;
  channel?: string;
  currency: string;
  ip_address?: string;
  metadata?: number;
  log?: Log;
  fees: any;
  customer?: Customer;
  authorization?: Authorization;
  plan?: Plan;
  source?: string;
  source_details: any;
  reason?: string;
  recipient?: Recipient;
  transfer_code?: string;
  transferred_at?: string;
}

export interface Log {
  time_spent: number;
  attempts: number;
  authentication: string;
  errors: number;
  success: boolean;
  mobile: boolean;
  input: any[];
  channel: any;
  history: History[];
}

export interface History {
  type: string;
  message: string;
  time: number;
}

export interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  customer_code: string;
  phone: any;
  metadata: any;
  risk_action: string;
}

export interface Authorization {
  authorization_code: string;
  bin: string;
  last4: string;
  exp_month: string;
  exp_year: string;
  card_type: string;
  bank: string;
  country_code: string;
  brand: string;
}

export interface Plan {}

export interface Recipient {
  domain: string;
  type: string;
  currency: string;
  name: string;
  details: Details;
  description: any;
  metadata: any;
  recipient_code: string;
  active: boolean;
}

export interface Details {
  account_number: string;
  account_name: any;
  bank_code: string;
  bank_name: string;
}