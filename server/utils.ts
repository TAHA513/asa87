export function cleanDatabaseUrl(url: string): string {
  // Remove quotes and whitespace
  let cleanUrl = url.replace(/['"]/g, '').trim();
  
  // Validate URL format
  try {
    new URL(cleanUrl);
    return cleanUrl;
  } catch (error) {
    throw new Error(`Invalid database URL format: ${error.message}`);
  }
}
