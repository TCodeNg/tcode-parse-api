import { Product }             from "model";
import { initPaystackPayment } from "../cloud-functions";

let cart: Parse.Object;
let contact: Parse.Object;

const beforeSave = async (req: Parse.Cloud.BeforeSaveRequest) => {
    const user = req.user;
    const order = req.object;

    if (!user || !req.master) {
        throw 'User not authenticated';
    }

    if (!order.existed()) {
        const cartQuery = new Parse.Query('Cart');
        cartQuery.equalTo('userId', user.id);
        try {
            cart = await cartQuery.first({ sessionToken: user.getSessionToken() });
        } catch (e) {
            if (e.code === Parse.Error.OBJECT_NOT_FOUND) {
                throw 'Cart not found'
            } else {
                throw e;
            }
        }

        try {
            const contactQuery = new Parse.Query('Contact');
            contactQuery.equalTo('userId', user.id);
            contact = await contactQuery.first({useMasterKey: true});
            order.set('contact', contact.get('payload'));
        } catch (e) {
            console.log(e);
        }

        const products = cart.get('products');
        order.set('products', products);
        order.set('user', user);

        const acl = new Parse.ACL();

        acl.setPublicReadAccess(false);
        acl.setPublicWriteAccess(false);
        acl.setRoleReadAccess('admin', true);
        acl.setRoleWriteAccess('admin', true);
        acl.setReadAccess(user, true);
        acl.setWriteAccess(user, true);
        order.setACL(acl);
    }

    if (!order.has('gateway')) {
        const gateway: { [key: string]: any } = {};
        gateway.paystack = await getPaystack(user, order);
        order.set('gateway', gateway);
    }

}
const afterSave = async (req: Parse.Cloud.AfterSaveRequest) => {
    const user = req.user;
    const order = req.object;
    if (!order.existed()) {
        const cartQuery = new Parse.Query('Cart');
        cartQuery.equalTo('userId', user.id);

        try {
            cart = await cartQuery.first({ sessionToken: user.getSessionToken() });
        } catch (e) {
            if (e.code === Parse.Error.OBJECT_NOT_FOUND) {
                throw 'Cart not found'
            } else {
                throw e;
            }
        }

        cart.set('products', {});
        try {
            await cart.save(null, { useMasterKey: true })
        } catch (e) {
            throw 'Could not empty cart';
        }
    }
}

async function getPaystack(user: Parse.User, order: Parse.Object) {
    const obj: { [key: string]: Product } | undefined = order.get('products');
    const products: Product[] = Object.values(obj) ?? [];
    const totalDue: number = products.reduce((acc, curr) => (acc + curr.price.value), 0);

    const paystackPaymentConfig = {
        email: user.getEmail(),
        currency: 'NGN',
        amount: totalDue * 100,
        reference: order.id
    };

    try {
        return await initPaystackPayment(paystackPaymentConfig);
    } catch (error) {
        console.error('Could not set paystack', error);
        throw error.message ?? 'Could not set paystack gateway';
    }
}

export const orderActions = {
    beforeSave,
    afterSave
}
