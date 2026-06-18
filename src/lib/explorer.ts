// Centralized block-explorer + network config.
// O'Watch claims OWT on Base Sepolia; all explorer links flow through here so the
// network can be swapped in one place (e.g. Base mainnet) without hunting inline URLs.
import { BASE_SEPOLIA_CHAIN_ID } from "./contracts";

export const NETWORK_LABEL = "Base Sepolia";
export const EXPLORER_NAME = "BaseScan";
export const EXPLORER_BASE_URL = "https://sepolia.basescan.org";
export const NETWORK_CHAIN_ID = BASE_SEPOLIA_CHAIN_ID;

export const getExplorerTxUrl = (hash: string): string =>
  `${EXPLORER_BASE_URL}/tx/${hash}`;

export const getExplorerAddressUrl = (address: string): string =>
  `${EXPLORER_BASE_URL}/address/${address}`;

export const getExplorerTokenUrl = (address: string): string =>
  `${EXPLORER_BASE_URL}/token/${address}`;

// Truncate an EVM address / hash for compact display: 0x1234…abcd
export const shortenHex = (value: string, lead = 6, tail = 4): string =>
  value.length > lead + tail
    ? `${value.slice(0, lead)}…${value.slice(-tail)}`
    : value;
