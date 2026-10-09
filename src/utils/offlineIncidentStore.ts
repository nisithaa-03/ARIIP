// src/utils/offlineIncidentStore.ts

export interface OfflineIncident {
  id: string;
  ticketNumber: string;

  hazardType: string;
  severity: string;
  confidence: number;
  department: string;

  latitude: number;
  longitude: number;

  address: string;
  city: string;
  state: string;

  description: string;

  imageBlob: Blob | null;

  detectedAt: string;

  syncStatus:
    | "pending_ai"
    | "pending_sync"
    | "synced"
    | "failed";

  createdAt: string;
  retryCount: number;
}

const DB_NAME = "ARIIPOfflineDB";
const DB_VERSION = 1;
const STORE_NAME = "incidents";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(
        new Error(
          "IndexedDB is not supported by this browser."
        )
      );
      return;
    }

    const request = indexedDB.open(
      DB_NAME,
      DB_VERSION
    );

    request.onupgradeneeded = () => {
      const db = request.result;

      if (
        !db.objectStoreNames.contains(
          STORE_NAME
        )
      ) {
        const store =
          db.createObjectStore(
            STORE_NAME,
            {
              keyPath: "id",
            }
          );

        store.createIndex(
          "syncStatus",
          "syncStatus",
          {
            unique: false,
          }
        );

        store.createIndex(
          "createdAt",
          "createdAt",
          {
            unique: false,
          }
        );
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(
        request.error ||
          new Error(
            "Failed to open ARIIP IndexedDB."
          )
      );
    };
  });
}

export async function saveOfflineIncident(
  incident: OfflineIncident
): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      "readwrite"
    );

    const store =
      transaction.objectStore(
        STORE_NAME
      );

    store.put(incident);

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };

    transaction.onerror = () => {
      db.close();

      reject(
        transaction.error ||
          new Error(
            "Failed to save offline incident."
          )
      );
    };
  });
}

export async function getOfflineIncident(
  id: string
): Promise<OfflineIncident | null> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      "readonly"
    );

    const store =
      transaction.objectStore(
        STORE_NAME
      );

    const request = store.get(id);

    request.onsuccess = () => {
      db.close();
      resolve(
        request.result || null
      );
    };

    request.onerror = () => {
      db.close();

      reject(
        request.error ||
          new Error(
            "Failed to read offline incident."
          )
      );
    };
  });
}

export async function getPendingIncidents(): Promise<
  OfflineIncident[]
> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      "readonly"
    );

    const store =
      transaction.objectStore(
        STORE_NAME
      );

    const request = store.getAll();

    request.onsuccess = () => {
      const incidents =
        request.result.filter(
          (
            incident: OfflineIncident
          ) =>
            incident.syncStatus ===
              "pending_ai" ||
            incident.syncStatus ===
              "pending_sync"
        );

      db.close();
      resolve(incidents);
    };

    request.onerror = () => {
      db.close();
      reject(
        request.error ||
          new Error(
            "Failed to read pending incidents."
          )
      );
    };
  });
}

export async function updateOfflineIncident(
  incident: OfflineIncident
): Promise<void> {
  await saveOfflineIncident(
    incident
  );
}

export async function deleteOfflineIncident(
  id: string
): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      "readwrite"
    );

    const store =
      transaction.objectStore(
        STORE_NAME
      );

    store.delete(id);

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };

    transaction.onerror = () => {
      db.close();

      reject(
        transaction.error ||
          new Error(
            "Failed to delete offline incident."
          )
      );
    };
  });
}