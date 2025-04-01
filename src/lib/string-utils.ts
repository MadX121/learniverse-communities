
/**
 * Gets the initials from a name
 * @param name The name to get initials from
 * @returns The initials (max 2 characters)
 */
export function getInitials(name: string): string {
  if (!name) return "U";
  
  const parts = name.split(/\s+/).filter(Boolean);
  
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
