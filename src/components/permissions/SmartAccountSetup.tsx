'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Rocket, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { useAccount } from 'wagmi';
import { useAdvancedPermissions } from '@/hooks/useAdvancedPermissions';
import { useState } from 'react';

export function SmartAccountSetup() {
  const { address } = useAccount();
  const { checkSmartAccount } = useAdvancedPermissions();
  const [isChecking, setIsChecking] = useState(false);
  const [hasSmartAccount, setHasSmartAccount] = useState<boolean | null>(null);

  const handleCheckSmartAccount = async () => {
    setIsChecking(true);
    const result = await checkSmartAccount();
    setHasSmartAccount(result);
    setIsChecking(false);
  };

  if (!address) {
    return (
      <Alert className="bg-blue-500/10 border-blue-500/20">
        <AlertCircle className="h-4 w-4 text-blue-400" />
        <AlertDescription>
          Please connect your wallet to check Smart Account status
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-blue-500/5">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Rocket className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <CardTitle>MetaMask Smart Account</CardTitle>
            <CardDescription>
              Required for Advanced Permissions (ERC-7715)
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasSmartAccount === null && (
          <>
            <Alert className="bg-gray-900/50 border-gray-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>What is a Smart Account?</strong>
                <br />
                A MetaMask Smart Account enables gasless transactions, batch operations, 
                and Advanced Permissions without repeated signature prompts.
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleCheckSmartAccount}
              disabled={isChecking}
              className="w-full"
              variant="outline"
            >
              {isChecking ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  Check Smart Account Status
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </>
        )}

        {hasSmartAccount === true && (
          <Alert className="bg-green-500/10 border-green-500/20">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            <AlertDescription>
              <strong className="text-green-400">Smart Account Active!</strong>
              <br />
              You can now use Advanced Permissions for seamless service access.
            </AlertDescription>
          </Alert>
        )}

        {hasSmartAccount === false && (
          <>
            <Alert className="bg-yellow-500/10 border-yellow-500/20">
              <AlertCircle className="h-4 w-4 text-yellow-400" />
              <AlertDescription>
                <strong className="text-yellow-400">Smart Account Required</strong>
                <br />
                Advanced Permissions (ERC-7715) require a MetaMask Smart Account. 
                <strong> MetaMask Flask will automatically prompt you to upgrade</strong> when you request permissions below.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Rocket className="h-4 w-4 text-blue-400" />
                  How Smart Account Upgrade Works
                </h4>
                <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside ml-2">
                  <li>Click <strong>"Request Permission"</strong> below for any service</li>
                  <li>MetaMask Flask will detect you need a Smart Account</li>
                  <li>Flask will <strong>automatically prompt you to upgrade</strong></li>
                  <li>Approve the upgrade in the Flask popup</li>
                  <li>Your permission request continues normally</li>
                </ol>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleCheckSmartAccount}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Recheck Status
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <a 
                    href="https://chromewebstore.google.com/detail/metamask-flask-developmen/ljfoeinjpaedjfecbmggjgodbgkmjkjk" 
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Get Flask
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              </div>

              <Alert className="bg-gray-900/50 border-gray-800">
                <AlertCircle className="h-4 w-4 text-gray-400" />
                <AlertDescription className="text-xs">
                  <strong>Note:</strong> You're already using MetaMask Flask (regular MetaMask disabled). 
                  The Smart Account upgrade happens automatically during your first permission request - 
                  just proceed to request permissions below! 🚀
                </AlertDescription>
              </Alert>
            </div>
          </>
        )}

        <div className="pt-4 border-t border-gray-800">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              ERC-7715
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Account Abstraction
            </Badge>
            <Badge variant="secondary" className="text-xs">
              ERC-4337
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
