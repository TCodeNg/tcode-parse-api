import { Event, EVENTS, isPaystackEvent, PaystackEvent } from "../utils";
import * as axios from 'axios';

export const verify = async(req: Parse.Cloud.FunctionRequest) => {
  const params = req.params;
  console.log(params);
};

export const webhook = async(req: Parse.Cloud.FunctionRequest) => {
  const params: Event = req.params as Event;
  if (isPaystackEvent(params)) {
    return await handlePaystack(params);
  }
};

const handlePaystack = async (_event: PaystackEvent) => {
  const id = _event.data.reference;
  let status = 'processing';
  if (_event.event === EVENTS.CHARGE_SUCCESS) {
    status = 'paid';
  }
  const query = new Parse.Query('Order');
  query.equalTo('objectId', id);
  const order = await query.first({useMasterKey: true});
  order.set('status', status);
  return await order.save(null, { useMasterKey: true });
}

export const initPaystackPayment = async (config: any) => {
  const _config: axios.AxiosRequestConfig = {
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SK}`
    },
  };
  const { data } = await axios.default.post(`${process.env.PAYSTACK_BEP}/transaction/initialize`, config, _config);
  return data.data;
}
