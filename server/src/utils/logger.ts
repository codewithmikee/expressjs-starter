/**
 * Simple logging utility to maintain consistent log formatting
 */
export function log(message: string, source = "express") {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${timestamp} [${source}] ${message}`);
}

export function error(message: string, err?: any, source = "express") {
  const timestamp = new Date().toLocaleTimeString();
  console.error(`${timestamp} [${source}] ERROR: ${message}`);
  if (err) {
    console.error(err);
  }
}