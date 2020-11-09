export enum EVENTS {
  CHARGE_SUCCESS = 'charge.success', // A successful charge was made
  SUBSCRIPTION_CREATE =  'subscription.create', // A subscription has been created
  SUBSCRIPTION_DISABLE = 'subscription.disable', // A subscription on your account has been disabled
  SUBSCRIPTION_ENABLE = 'subscription.enable', // A subscription on your account has been enabled
  INVOICE_CREATE = 'invoice.create', // An invoice has been created for a subscription on your account. This usually happens 3 days before the subscription is due or whenever we send the customer their first pending invoice notification
  INVOICE_UPDATE = 'invoice.update', // An invoice has been updated. This usually means we were able to charge the customer successfully. You should inspect the invoice object returned and take necessary action
  INVOICE_FAILED = 'invoice.failed', // An invoice has not been created for the subscription because the customer's payment for the subscription failed
  TRANSFER_SUCCESS = 'transfer.success', // A successful transfer has been completed
  TRANSFER_FAILED = 'transfer.failed', // A transfer you attempted has failed
  CUSTOMERIDENTIFICATION_SUCCESS = 'customeridentification.success', // A customer ID validation was successful
  CUSTOMERIDENTIFICATION_FAILED = 'customeridentification.failed', // A customer ID validation has failed
  TRANSFER_REVERSED = 'transfer.reversed', // A transfer you attempted has been reversed
  PAYMENTREQUEST_PENDING = 'paymentrequest.pending', // A payment request has been sent to a customer
  PAYMENTREQUEST_SUCCESS = 'paymentrequest.success' // A payment request has been paid for
}