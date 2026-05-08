const DB_NAME = "InterviewMitraDB";
const DB_VERSION = 4; // Bumped version

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("videos")) {
        db.createObjectStore("videos");
      }
      if (!db.objectStoreNames.contains("question_videos")) {
        db.createObjectStore("question_videos");
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const saveVideo = async (blob: Blob) => {
  const db = await initDB();
  const tx = db.transaction("videos", "readwrite");
  tx.objectStore("videos").put(blob, "session_video");
};

export const getVideo = async (): Promise<Blob | null> => {
  const db = await initDB();
  try {
    const tx = db.transaction("videos", "readonly");
    return new Promise((resolve) => {
      const request = tx.objectStore("videos").get("session_video");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    });
  } catch (e) {
    console.warn("Video store not ready:", e);
    return null;
  }
};

export const saveQuestionVideo = async (id: number, blob: Blob) => {
  const db = await initDB();
  const tx = db.transaction("question_videos", "readwrite");
  tx.objectStore("question_videos").put(blob, `q_${id}`);
};

export const getQuestionVideo = async (id: number): Promise<Blob | null> => {
  const db = await initDB();
  try {
    const tx = db.transaction("question_videos", "readonly");
    return new Promise((resolve) => {
      const request = tx.objectStore("question_videos").get(`q_${id}`);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    });
  } catch (e) {
    console.warn("Question video store not ready:", e);
    return null;
  }
};
