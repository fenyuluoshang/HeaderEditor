import { getSync } from './storage';
import { IS_CHROME } from './utils';
import { TABLE_NAMES, TinyRule } from './var';

function getTotalCount(rules: { [key: string]: TinyRule[] }) {
  let count = 0;
  TABLE_NAMES.forEach(e => (count += rules[e].length));
  return count;
}

interface SyncMeta {
  time: number;
  index: number;
}

class BrowserSync {
  save(rules: { [key: string]: TinyRule[] }) {
    return new Promise((resolve, reject) => {
      if (IS_CHROME) {
        const toSave: { [key: string]: any } = {};
        // split
        const limit = chrome.storage.sync.QUOTA_BYTES_PER_ITEM - 500;
        let index = 0;
        while (getTotalCount(rules) > 0) {
          const one: { [key: string]: TinyRule[] } = {};
          TABLE_NAMES.forEach(e => {
            one[e] = [];
          });
          let t = 0;
          let toPut: TinyRule | null = null;
          while (JSON.stringify(one).length < limit) {
            // find avaliable
            while (TABLE_NAMES[t] && rules[TABLE_NAMES[t]].length === 0) {
              t++;
            }
            if (!TABLE_NAMES[t]) {
              break;
            }
            toPut = rules[TABLE_NAMES[t]].splice(0, 1)[0];
            one[TABLE_NAMES[t]].push(toPut);
          }
          if (TABLE_NAMES[t] && toPut) {
            rules[TABLE_NAMES[t]].push(toPut);
            one[TABLE_NAMES[t]].splice(one[TABLE_NAMES[t]].indexOf(toPut), 1);
          }
          toSave[`backup_${index++}`] = one;
        }
        toSave.backup = {
          time: new Date().getTime(),
          index: index - 1,
        };
        getSync()
          .set(toSave)
          .then(resolve)
          .catch(reject);
      } else {
        getSync()
          .set({
            backup: {
              time: new Date().getTime(),
              index: 0,
            },
            backup_0: rules,
          })
          .then(resolve)
          .catch(reject);
      }
    });
  }

  getMeta(): Promise<SyncMeta> {
    return new Promise((resolve, reject) => {
      getSync()
        .get('backup')
        .then(e => {
          resolve(e.backup);
        })
        .catch(reject);
    });
  }

  getContent(): Promise<{ [key: string]: TinyRule[] }> {
    return new Promise((resolve, reject) => {
      getSync()
        .get('backup')
        .then(e => {
          const { index } = e.backup;
          const result: { [key: string]: TinyRule[] } = {};
          TABLE_NAMES.forEach(it => {
            result[it] = [];
          });
          const toGet: string[] = [];
          for (let i = 0; i <= index; i++) {
            toGet.push(`backup_${i}`);
          }
          getSync()
            .get(toGet)
            .then(res => {
              toGet.forEach(name => {
                TABLE_NAMES.forEach(it => {
                  result[it] = result[it].concat(res[name][it]);
                });
              });
              resolve(result);
            });
        })
        .catch(reject);
    });
  }

  clear() {
    return new Promise((resolve, reject) => {
      const toRemove = ['backup'];
      getSync()
        .get('backup')
        .then(e => {
          if (e.backup) {
            const { index } = e.backup;
            const result: { [key: string]: TinyRule[] } = {};
            TABLE_NAMES.forEach(it => {
              result[it] = [];
            });
            for (let i = 0; i <= index; i++) {
              toRemove.push(`backup_${i}`);
            }
          }
          getSync()
            .remove(toRemove)
            .then(resolve)
            .catch(reject);
        })
        .catch(reject);
    });
  }
}

export default new BrowserSync();
