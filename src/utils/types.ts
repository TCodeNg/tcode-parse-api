import { PaystackEvent } from "./paystack/paystack.event";
export type PaystackEventType = PaystackEvent;
export type Event = PaystackEventType;

export const isPaystackEvent = (event: Event): boolean => {
  return (event as PaystackEventType).data !== undefined;
}