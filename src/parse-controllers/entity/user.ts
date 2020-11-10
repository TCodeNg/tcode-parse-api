import { updateMeta } from './meta';

const useMasterKey = {useMasterKey:true};

const addUserToRRole = async (user: Parse.User, roleName: string) => {
  let userRole: Parse.Role;

  // Add to user role
  const roleQuery = new Parse.Query<Parse.Role>(Parse.Role);
  roleQuery.equalTo('name', roleName);

  userRole = await roleQuery.first(useMasterKey);

  if (!userRole) {
    const userRoleACL = new Parse.ACL();
    userRoleACL.setPublicReadAccess(false);
    userRole = new Parse.Role(roleName, userRoleACL);
    userRole.setName(roleName);
    await userRole.save(null, useMasterKey);
  }

  userRole.getUsers().add(user);

  await userRole.save(null, useMasterKey);
}

const beforeSave: (req: Parse.Cloud.BeforeSaveRequest) => Promise<void> = async (req: Parse.Cloud.BeforeSaveRequest) => {
  return;
};
const afterSave: (req: Parse.Cloud.AfterSaveRequest) => Promise<void> = async (req: Parse.Cloud.AfterSaveRequest) => {
  const user: User = req.object as User;
  if (!user.existed()) {
    await addUserToRRole(user, 'user');
    await updateMeta(1, 'user'); // Update user meta
    await updateMeta(1, 'activeUser'); // Update active user meta
    const cart = new Parse.Object('Cart');
    const ACL = new Parse.ACL();
    
    ACL.setPublicReadAccess(false);
    ACL.setPublicWriteAccess(false);
    ACL.setRoleReadAccess('admin', true);
    ACL.setRoleWriteAccess('admin', true);
    cart.setACL(ACL);
    cart.set('userId', user.id);
    await cart.save(null, { sessionToken: user.getSessionToken() });
  }
};

const afterDelete: (req: Parse.Cloud.AfterDeleteRequest) => Promise<void> = async (req: Parse.Cloud.AfterDeleteRequest) => {
  const user: User = req.object as User;
  await updateMeta(-1, 'user'); // Update user meta
  await updateMeta(-1, 'activeUser'); // Update active user meta
  return;
}

const beforeLogin: (req: Parse.Cloud.TriggerRequest) => Promise<void> = async (req: Parse.Cloud.TriggerRequest) => {
  const { object: user }  = req;

  // Check banned user

  if (user.get('isBanned')) {
    throw new Error('Access denied, you have been banned.');
  }

  // check anonymous cart
  const installationId = req.installationId;
  let anonymousCart: Parse.Object;
  let userCart: Parse.Object;
  if (!!installationId) {
    const anonymousCartQuery = new Parse.Query('Cart');
    anonymousCartQuery.equalTo('userId', installationId);
    anonymousCart = await anonymousCartQuery.first(useMasterKey);
  }

  if (!!anonymousCart) {
    const userCartQuery = new Parse.Query('Cart');
    userCartQuery.equalTo('userId', user.id);
    userCart = await userCartQuery.first(useMasterKey);


    const anonymousProducts: { [key: string]: any } = anonymousCart?.get('products') ?? {};
    const userProducts: { [key: string]: any } = userCart?.get('products') ?? {};

    const newCartProduct = {
      ...userProducts,
      ...anonymousProducts
    };

    userCart.set('products', newCartProduct);

    await userCart.save(null, useMasterKey);
  }
};
const afterLogOut: (req: Parse.Cloud.TriggerRequest) => Promise<void> = async (req: Parse.Cloud.TriggerRequest) => {
  const {object: session} = req;
  const user = session.get('user');
  user.set('isOnline', false);
  user.save(null, useMasterKey);
};

export const userActions = {
  beforeSave,
  afterSave,
  afterDelete,
  beforeLogin,
  afterLogOut
}

export class User extends Parse.User {
  constructor(attributes: any) {
    super(attributes)
  }
}

Parse.Object.registerSubclass('_User', User);
