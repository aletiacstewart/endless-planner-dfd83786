const KEY = (plannerId: string) => `planner-unlock:${plannerId}`;
const DEVICE_KEY = "planner-device-id";

export function getDeviceId(): string {
  try {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch {
    return "anonymous-device";
  }
}

export function setUnlocked(plannerId: string, code: string) {
  try {
    localStorage.setItem(KEY(plannerId), code);
  } catch {}
}

export function isUnlocked(plannerId: string): boolean {
  try {
    return Boolean(localStorage.getItem(KEY(plannerId)));
  } catch {
    return false;
  }
}

export function clearUnlock(plannerId: string) {
  try {
    localStorage.removeItem(KEY(plannerId));
  } catch {}
}
