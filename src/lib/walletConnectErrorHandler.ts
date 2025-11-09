// Suppress some non-critical console warnings
if (typeof window !== "undefined") {
  const originalWarn = console.warn;

  console.warn = (...args: unknown[]) => {
    const message = String(args[0] || "");
    if (message.includes("pino") || message.includes("@walletconnect")) {
      return;
    }
    originalWarn.apply(console, args);
  };
}

export {};

export {};
