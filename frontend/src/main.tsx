import React from "react";
import ReactDOM from "react-dom/client";
import { createAppKit } from '@reown/appkit/react';
import { Ethers5Adapter } from '@reown/appkit-adapter-ethers5';
import { liskSepolia } from '@reown/appkit/networks';

import App from "./App";
import "./index.css";

const projectId = '3102134499196a5e11d06c9dc445398f';
const networks = [liskSepolia] as [any, ...any[]];

const metadata = {
  name: 'Invincible Faucet',
  description: 'Invincible Faucet Application',
  url: window.location.origin,
  icons: ['https://avatars.githubusercontent.com/u/179229932']
};

createAppKit({
  adapters: [new Ethers5Adapter()],
  networks,
  metadata,
  projectId,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-font-family': '"IBM Plex Mono", monospace',
    '--w3m-accent': '#c8ff00',
    '--w3m-color-mix': '#0e0e0e',
    '--w3m-color-mix-strength': 20,
    '--w3m-border-radius-master': '1px'
  },
  features: {
    analytics: true
  }
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
