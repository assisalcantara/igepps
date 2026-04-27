/**
 * Wrappers seguros para localStorage.
 * Evita SecurityError em Safari modo privado, iframes sandbox e
 * browsers com armazenamento bloqueado por política de segurança.
 */

export function safeGetItem(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function safeRemoveItem(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}
