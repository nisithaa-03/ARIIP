
import {
  getPendingIncidents,
  updateOfflineIncident,
  deleteOfflineIncident,
} from "./offlineIncidentStore";

const BACKEND_URL = "http://127.0.0.1:8000";

/**
 * Sync all pending offline incidents when internet is available.
 */
export async function syncPendingIncidents(): Promise<void> {
  if (!navigator.onLine) {
    console.log("Offline: skipping incident sync.");
    return;
  }

  let pendingIncidents: Awaited<
    ReturnType<typeof getPendingIncidents>
  >;

  try {
    pendingIncidents = await getPendingIncidents();
  } catch (error) {
    console.error("Failed to retrieve pending incidents:", error);
    return;
  }

  if (pendingIncidents.length === 0) {
    console.log("No pending offline incidents.");
    return;
  }

  console.log(
    `Found ${pendingIncidents.length} pending incident(s). Starting sync...`
  );

  for (const incident of pendingIncidents) {
    try {
      await syncSingleIncident(incident);
    } catch (error) {
      console.error(
        `Failed to sync incident ${incident.id}:`,
        error
      );

      // Keep the local record so it can be retried later.
      try {
        await updateOfflineIncident({
          ...incident,
          syncStatus: "pending_ai",
          retryCount: incident.retryCount + 1,
        });
      } catch (storageError) {
        console.error(
          `Failed to update local incident ${incident.id}:`,
          storageError
        );
      }
    }
  }
}

/**
 * Upload one offline image to FastAPI.
 * The backend runs AI detection and saves the analyzed incident.
 */
async function syncSingleIncident(
  incident: Awaited<
    ReturnType<typeof getPendingIncidents>
  >[number]
): Promise<void> {
  if (!incident.imageBlob) {
    throw new Error("Incident has no image to upload.");
  }

  const formData = new FormData();

  formData.append(
    "file",
    incident.imageBlob,
    `${incident.id}.jpg`
  );

  // Preserve the GPS coordinates recorded during offline capture.
  formData.append("latitude", String(incident.latitude));
  formData.append("longitude", String(incident.longitude));

  // Upload the saved image to the backend.
  const response = await fetch(
    `${BACKEND_URL}/upload-hazard`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(
      `Backend returned HTTP ${response.status}`
    );
  }

  const backendResult = await response.json();

  console.log("Offline incident AI result:", backendResult);

  // Do not delete the local copy unless the backend confirms saving it.
  if (
    backendResult.success !== true ||
    !backendResult.incident_id
  ) {
    throw new Error(
      "Backend did not confirm that the incident was saved."
    );
  }

  // The analyzed incident is saved on the backend.
  await deleteOfflineIncident(incident.id);

  console.log(
    "Offline incident successfully synced:",
    backendResult
  );

  // Tell the dashboard to fetch the latest backend incidents.
  window.dispatchEvent(
    new CustomEvent("incident-synced", {
      detail: {
        localIncidentId: incident.id,
        backendIncidentId: backendResult.incident_id,
        issue: backendResult.issue,
        confidence: backendResult.confidence,
        severity: backendResult.severity,
        department: backendResult.department,
      },
    })
  );
}
