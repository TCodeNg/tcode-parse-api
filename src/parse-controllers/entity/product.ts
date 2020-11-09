const beforeSave = async (req: Parse.Cloud.BeforeSaveRequest): Promise<void> => {
  const product = req.object;
  const user = req.user;
  const isMaster = req.master;
  const productACL = new Parse.ACL();
  if (user) {
    productACL.setReadAccess(user, true);
    productACL.setWriteAccess(user, true);
  }

  if (!user && !isMaster) {
    throw new Parse.Error(Parse.Error.INVALID_QUERY, 'Unauthorized');
  }

  if (!product.existed()) {
    productACL.setRoleReadAccess('admin', true);
    productACL.setRoleWriteAccess('admin', true);
    product.setACL(productACL);
    product.set('productOwner', user);
    product.set('status', 'pending');
  } else {
    const isUnpublished = req.original?.get('status') === 'pending';
    const shouldPublish = req.object.get('status') === 'published';
    if (isUnpublished && shouldPublish) {
      productACL.setRoleReadAccess('user', true);
      productACL.setRoleWriteAccess('admin', true);
      product.setACL(productACL);
    }
  }
}

const afterSave = async (req: Parse.Cloud.AfterSaveRequest) => {
  
}

export const productActions = {
  beforeSave
}