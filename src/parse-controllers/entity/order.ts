let cart: Parse.Object;

const beforeSave = async (req: Parse.Cloud.BeforeSaveRequest) => {
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

        const products = cart.get('products');
        order.set('products', products);

        const acl = new Parse.ACL();

        acl.setPublicReadAccess(false);
        acl.setPublicWriteAccess(false);
        acl.setRoleReadAccess('admin', true);
        acl.setRoleWriteAccess('admin', true);
        acl.setReadAccess(user, true);
        acl.setWriteAccess(user, true);
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

export const orderActions = {
    beforeSave,
    afterSave
}
