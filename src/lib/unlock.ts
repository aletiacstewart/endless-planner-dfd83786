const KEY = (plannerId: string) => `planner-unlock:${plannerId}`;

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
