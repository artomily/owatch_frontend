// Suppress Supabase non-critical warnings
if (typeof window !== "undefined") {
  const originalWarn = console.warn;

  console.warn = (...args: unknown[]) => {
    const message = String(args[0] || "");

    // Only suppress specific non-critical warnings
    if (message.includes("pino")) {
      return;
    }

    originalWarn.apply(console, args);
  };
}

export {};
