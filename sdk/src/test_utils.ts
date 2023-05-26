import { indexedDB } from "fake-indexeddb";

export function deleteDB(name: string) {
  return new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(name);
    request.onupgradeneeded = () => {};
    request.onsuccess = () => {
      resolve();
    };

    request.onerror = (err) => {
      reject(err);
    };
  });
}
