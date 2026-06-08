export function cleanupLocalStorage(): void {
  try {
    const keysToRemove = ['auth_token', 'user_session', 'workspace_id']
    keysToRemove.forEach(key => localStorage.removeItem(key))
  } catch (error) {
    console.error('Failed to cleanup localStorage:', error)
  }
}

export function clearBusinessLocalStorage(): void {
  cleanupLocalStorage()
}

export default cleanupLocalStorage
