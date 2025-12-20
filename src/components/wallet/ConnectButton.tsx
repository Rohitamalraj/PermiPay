'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { formatAddress } from '@/lib/utils';
import { Wallet, LogOut } from 'lucide-react';

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <Button
        variant="outline"
        onClick={() => disconnect()}
        className="gap-2"
      >
        <Wallet className="h-4 w-4" />
        {formatAddress(address)}
        <LogOut className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      onClick={() => {
        const metamaskConnector = connectors.find((c) => c.id === 'metaMask');
        if (metamaskConnector) {
          connect({ connector: metamaskConnector });
        }
      }}
      className="gap-2"
    >
      <Wallet className="h-4 w-4" />
      Connect Wallet
    </Button>
  );
}
