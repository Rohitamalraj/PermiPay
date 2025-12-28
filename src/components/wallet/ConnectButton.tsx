'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { formatAddress } from '@/lib/utils';
import { Wallet, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, error, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (error) {
      toast.error(error.message || 'Failed to connect wallet');
    }
  }, [error]);

  if (!isClient) {
    return (
      <Button disabled className="gap-2">
        <Wallet className="h-4 w-4" />
        Loading...
      </Button>
    );
  }

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

  const handleConnect = async () => {
    try {
      // Try to find injected (MetaMask) connector first
      let connector = connectors.find((c) => c.id === 'injected' || c.type === 'injected');
      
      // Fallback to metaMask connector
      if (!connector) {
        connector = connectors.find((c) => c.id === 'io.metamask' || c.id === 'metaMask');
      }
      
      if (!connector) {
        console.log('Available connectors:', connectors.map(c => ({ id: c.id, name: c.name, type: c.type })));
        toast.error('MetaMask connector not found. Please install MetaMask extension.');
        return;
      }

      console.log('Connecting with connector:', connector.id, connector.name);
      await connect({ connector });
    } catch (err: any) {
      console.error('Connection error:', err);
      toast.error(err?.message || 'Failed to connect wallet');
    }
  };

  return (
    <Button
      onClick={handleConnect}
      disabled={isPending}
      className="gap-2 bg-gradient-to-r from-[#ff9e00] to-[#fbbf24] text-black font-semibold hover:opacity-90 glow-orange"
    >
      <Wallet className="h-4 w-4" />
      {isPending ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  );
}
