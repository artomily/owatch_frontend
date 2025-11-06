// Suppress Supabase Realtime connection errors
// Since we're not using Realtime features, we can safely ignore these errors

const originalConsoleError = console.error;

console.error = (...args: unknown[]) => {
  // Filter out Supabase Realtime connection errors
  const message = args[0];
  if (
    typeof message === "string" &&
    (message.includes("Connection interrupted while trying to subscribe") ||
      message.includes("Realtime connection") ||
      message.includes("WebSocket"))
  ) {
    // Silently ignore these errors
    return;
  }

  // Pass through all other errors
  originalConsoleError.apply(console, args);
};

export {};
