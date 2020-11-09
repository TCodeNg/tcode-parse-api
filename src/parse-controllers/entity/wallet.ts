import { updateMeta, Meta } from './meta';

const beforeSave: (req: Parse.Cloud.BeforeSaveRequest) => void = (req: Parse.Cloud.BeforeSaveRequest) => {
  const acl = new Parse.ACL();

  const user = req.user;
  const object = req.object;

  if (!user || !req.master) {
    throw 'User not authenticated.';
  }

  acl.setPublicReadAccess(false);
  acl.setPublicWriteAccess(false);
  acl.setRoleReadAccess('admin', true);
  acl.setRoleWriteAccess('admin', false);
  acl.setRoleReadAccess('superAdmin', true);
  acl.setRoleWriteAccess('superAdmin', true);
  if (!!user) {
    acl.setReadAccess(user, true);
    object.set('user', user);
  }
  object.setACL(acl);
  object.set('balance', 0);
};
const afterSave: (req: Parse.Cloud.AfterSaveRequest) => Promise<void> = async (req: Parse.Cloud.AfterSaveRequest) => {
  const wallet: Parse.Object = req.object;
  if (!wallet.existed()) {
    await updateMeta(1, 'wallet'); // Update user meta
    // await createMeta(wallet, req.user);
    return;
  }
  return;
};

const createMeta = async (obj: Parse.Object, user: Parse.User) => {
  const acl = new Parse.ACL();
  acl.setPublicReadAccess(false);
  acl.setPublicWriteAccess(false);
  acl.setRoleReadAccess('admin', true);
  acl.setRoleWriteAccess('admin', false);
  acl.setRoleReadAccess('superAdmin', true);
  acl.setRoleWriteAccess('superAdmin', true);
  acl.setReadAccess(user, true);
  await _createMeta(obj, user, acl, 'investmentMeta');
  await _createMeta(obj, user, acl, 'earningMeta');
}

const _createMeta = async (wallet: Parse.Object, user: Parse.User, acl: Parse.ACL, key: string) => {
  const investmentMeta = new Meta();
  investmentMeta.set('key', key);
  investmentMeta.set('amount', 0);
  investmentMeta.set('user', user);
  investmentMeta.set('currency', wallet.get('currencyCode'));
  investmentMeta.setACL(acl);
  await investmentMeta.save(null, {
    useMasterKey: true
  })
}

export const walletActions = {
  beforeSave,
  afterSave
};
