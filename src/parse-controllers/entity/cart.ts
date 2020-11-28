const beforeSave = async (req: Parse.Cloud.BeforeSaveRequest): Promise<void> => {
  const cart = req.object;
  const user = req.user;
  const isAnonymous = cart.get('type') === 'anonymous';
  if (!cart.existed()) {
    if (!user && !isAnonymous) {
      throw new Parse.Error(Parse.Error.INVALID_QUERY, 'User not valid');
    } else {
      if (!!user) {
        const acl = new Parse.ACL();
        acl.setReadAccess(user, true);
        acl.setWriteAccess(user, true);
        acl.setRoleReadAccess('admin', true);
        acl.setRoleWriteAccess('admin', true);
        cart.set('userId', user.id);
        cart.setACL(acl);
      }
      cart.set('products', {});
    }
  }
}

const clearCart = async (req: Parse.Cloud.FunctionRequest) => {
  const { userId } = req.params;

  const id = userId;

  if (!id) {
    throw new Parse.Error(Parse.Error.INVALID_QUERY, 'User not valid');
  }

  const query = new Parse.Query('Cart');
  query.equalTo('userId', id);

  const opts = req.user ? {sessionToken: req.user.getSessionToken()} : {useMasterKey: true};

  const cart = await query.first(opts);

  if (!!cart) {
    cart.set('products', {});
  }

  await cart.save(null, opts);
}

const removeFromCart = async (req: Parse.Cloud.FunctionRequest) => {

  const { userId, productId } = req.params;

  const id = userId;

  if (!id) {
    throw new Parse.Error(Parse.Error.INVALID_QUERY, 'User not valid');
  }

  const opts = req.user ? {sessionToken: req.user.getSessionToken()} : {useMasterKey: true};

  const query = new Parse.Query('Cart');
  query.equalTo('userId', id);

  const cart = await query.first(opts);

  if (!cart) {
    throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'Cart not found');
  }

  const productQuery = new Parse.Query('Product');
  const product = await productQuery.get(productId);

  if (!product) {
    throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'Product not found');
  }

  let products = product.get('products');
  let _product = products[productId];
  if (_product.quantity > 1) {
    _product = {
      ..._product,
      quantity: +_product.quantity - 1
    }
    products = {
      ...products,
      [`${productId}`]: _product
    }
  } else {
    delete products[productId];
  }
  cart.set('products', products);
  await cart.save(null, opts);
}

const addToCart = async (req: Parse.Cloud.FunctionRequest) => {

  const { userId, productId } = req.params;

  const id = userId;

  if (!id) {
    throw new Parse.Error(Parse.Error.INVALID_QUERY, 'User not valid');
  }

  const query = new Parse.Query('Cart');
  query.equalTo('userId', id);
  const productQuery = new Parse.Query('Product');
  let cart;
  let product;
  try {
   cart = await query.first({ useMasterKey: true });
    if (!cart) {
      throw new Error('Cart not found');
    }
  } catch (e) {
    throw e;
  }

  try {
    product = await productQuery.get(productId, { useMasterKey: true });
  } catch (e) {
    throw new Error('Product not found');
  }

  if (!!cart && !!product) {
    let products = product.get('products');

    const hasProduct = !!products[productId];
    cart.set('products', {
      ...products,
      [`${productId}`]: {
        item: product.toJSON(),
        quality: hasProduct ? +products[productId].quantity + 1 : 1,
        amount: products[productId].price
      }
    });
    await cart.save(null, { useMasterKey: true });
  }

}

const checkout = async (req: Parse.Cloud.FunctionRequest) => {
  const { userId } = req.params;
  const id = userId;
  if (!id) {
    throw new Parse.Error(Parse.Error.INVALID_QUERY, 'User not valid');
  }

  const query = new Parse.Query('Cart');
  query.equalTo('userId', id);

  const opts = req.user ? {sessionToken: req.user.getSessionToken()} : {useMasterKey: true};

  const cart = await query.first(opts);

  if (!cart) {
    throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'Cart not found');
  }

  const order = new Parse.Object('Order');
  order.set('userId', userId);
  order.set('products', cart.get('products'));

  await order.save(null, { useMasterKey: true });
  await clearCart(req);

  return order;
}

export const cartActions = {
  beforeSave,
  addToCart,
  removeFromCart,
  clearCart,
  checkout
}
