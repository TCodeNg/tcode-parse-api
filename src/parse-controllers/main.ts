import { webhook }           from './cloud-functions';
import { User, userActions } from './entity/user';
import { walletActions }     from './entity/wallet';
import { cartActions }       from './entity/cart';
import { productActions }    from './entity/product';
import { orderActions }      from "./entity/order";


// User
Parse.Cloud.beforeSave(User, userActions.beforeSave);
Parse.Cloud.afterSave(User, userActions.afterSave);
Parse.Cloud.afterDelete(User, userActions.afterDelete);
Parse.Cloud.beforeLogin(userActions.beforeLogin);
Parse.Cloud.afterLogout(userActions.afterLogOut);

// Wallet
Parse.Cloud.beforeSave('Wallet', walletActions.beforeSave);
Parse.Cloud.afterSave('Wallet', walletActions.afterSave);
Parse.Cloud.define('webhook', webhook);

// Cart
Parse.Cloud.beforeSave('Cart', cartActions.beforeSave);
Parse.Cloud.define('addToCart', cartActions.addToCart);
Parse.Cloud.define('removeFromCart', cartActions.removeFromCart);
Parse.Cloud.define('clearCart', cartActions.clearCart);
Parse.Cloud.define('checkout', cartActions.checkout);

// Product
Parse.Cloud.beforeSave('Product', productActions.beforeSave);

// Order
Parse.Cloud.beforeSave('Order', orderActions.beforeSave);
Parse.Cloud.afterSave('Order', orderActions.afterSave);
