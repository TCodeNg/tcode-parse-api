import { Event, EVENTS, isPaystackEvent, PaystackEvent } from "../utils";

export const verify = async(req: Parse.Cloud.FunctionRequest) => {
  const params = req.params;
  console.log(params);
};

export const webhook = async(req: Parse.Cloud.FunctionRequest) => {
  const params: Event = req.params as Event;
  console.log('PAYMENT EVENT', params);
  if (isPaystackEvent(params)) {
    handlePaystack(params);
  }
};

const handlePaystack = async (_event: PaystackEvent) => {
  const id = _event.data.reference;
  let status = 'processing';
  if (_event.event === EVENTS.CHARGE_SUCCESS) {
    status = 'success';
  }
  // const query = new Parse.Query('InvestmentRequest');
  // const request = await query.get(id, {useMasterKey: true});
  // if (!!request) {
  //   request.set('paymentStatus', status);
  //   request.set('paymentEvent', _event);
  //   await request.save(null, {useMasterKey: true});
  // } else {
  //   throw new ParseError('Investment not found');
  // }

}