// Simple IndexedDB wrapper for storing interview video
export async function saveVideo(blob: Blob) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("InterviewDB", 1);
    request.onupgradeneeded = (e: any) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("videos")) {
        db.createObjectStore("videos");
      }
    };
    request.onsuccess = (e: any) => {
      const db = e.target.result;
      const transaction = db.transaction("videos", "readwrite");
      const store = transaction.objectStore("videos");
      store.put(blob, "session_video");
      transaction.oncomplete = () => resolve(true);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getVideo(): Promise<Blob | null> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("InterviewDB", 1);
    request.onsuccess = (e: any) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("videos")) return resolve(null);
      const transaction = db.transaction("videos", "readonly");
      const store = transaction.objectStore("videos");
      const getRequest = store.get("session_video");
      getRequest.onsuccess = () => resolve(getRequest.result);
    };
    request.onerror = () => reject(request.error);
  });
}
