import React from "react";
import ReactDOM from "react-dom/client";
import { createAppKit } from '@reown/appkit/react';
import { Ethers5Adapter } from '@reown/appkit-adapter-ethers5';
import { sepolia } from '@reown/appkit/networks';

import App from "./App";
import "./index.css";

const projectId = '3102134499196a5e11d06c9dc445398f';
const networks = [sepolia] as [any, ...any[]];

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
  features: {
    analytics: true
  }
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
