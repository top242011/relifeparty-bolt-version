/**
 * Utility functions for the application
 */

/**
 * Validates if a string is a valid UUID format
 * @param uuid - The string to validate
 * @returns boolean - True if valid UUID, false otherwise
 */
export function isValidUUID(uuid: string | null | undefined): boolean {
  if (!uuid || typeof uuid !== 'string') {
    return false
  }
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}