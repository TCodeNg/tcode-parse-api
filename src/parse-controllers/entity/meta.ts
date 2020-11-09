import { baseACL } from './acl';

const useMasterKey = {useMasterKey:true};

export async function updateMeta(count: number, metaKey: string): Promise<Meta> {
  const meta = await Meta.updateMeta(metaKey, count);
  return meta.save(null, useMasterKey);
}

export class Meta extends Parse.Object {
  constructor() {
    super('Meta');
  }

  static async updateMeta(key: string, count = 1) {
    let meta: Meta;
    let newCount: number;

    const newMeta = () => {
      baseACL.setPublicReadAccess(false);
      baseACL.setPublicWriteAccess(false);
      baseACL.setRoleReadAccess('admin', true);
      baseACL.setRoleWriteAccess('admin', true);
      meta = new Meta();
      meta.set('key', key);
      meta.setACL(baseACL);
      newCount = count;
      meta.set('count', newCount);
      return meta;
    }

    try {
      const query = new Parse.Query(Meta);
      query.equalTo('key', key);
      meta = await query.first(useMasterKey);
      console.log('META', meta);
      if (!meta) {
        meta = newMeta();
      } else {
        meta.increment('count', count);
      }
    } catch (error) {
      meta = newMeta();
    }
    return meta;
  }
}

Parse.Object.registerSubclass('Meta', Meta);