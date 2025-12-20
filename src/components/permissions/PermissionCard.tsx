'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  AlertCircle,
  Sparkles,
  Loader2
} from 'lucide-react';
import { useAdvancedPermissions, ServiceType, SERVICE_PRICES } from '@/hooks/useAdvancedPermissions';
import { formatUnits } from 'viem';

interface PermissionCardProps {
  serviceType: ServiceType;
  serviceName: string;
  serviceDescription: string;
  serviceIcon: React.ReactNode;
  onPermissionGranted?: () => void;
}

export function PermissionCard({
  serviceType,
  serviceName,
  serviceDescription,
  serviceIcon,
  onPermissionGranted,
}: PermissionCardProps) {
  const {
    isLoading,
    error,
    sessionAccountAddress,
    requestPermission,
    getPermissionStatus,
  } = useAdvancedPermissions();

  const permissionStatus = getPermissionStatus(serviceType);
  const servicePrice = SERVICE_PRICES[serviceType];
  const priceUSD = formatUnits(servicePrice, 6);

  const handleRequestPermission = async () => {
    const success = await requestPermission(serviceType);
    if (success && onPermissionGranted) {
      onPermissionGranted();
    }
  };

  // If permission already granted and active
  if (permissionStatus?.hasPermission && permissionStatus.isActive) {
    const daysRemaining = Math.ceil((permissionStatus.expiresAt - Date.now()) / (1000 * 60 * 60 * 24));
    const spendingLimitUSD = formatUnits(permissionStatus.spendingLimit, 6);
    const spentUSD = formatUnits(permissionStatus.spentAmount, 6);
    const remainingUSD = formatUnits(permissionStatus.remainingBudget, 6);
    const progressPercent = Number((permissionStatus.spentAmount * 100n) / permissionStatus.spendingLimit);

    return (
      <Card className="border-green-500/50 bg-green-500/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {serviceIcon}
              <div>
                <CardTitle className="text-lg">{serviceName}</CardTitle>
                <CardDescription>{serviceDescription}</CardDescription>
              </div>
            </div>
            <Badge variant="default" className="bg-green-500 hover:bg-green-600">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Usage Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Usage</span>
              <span className="font-medium">${spentUSD} / ${spendingLimitUSD}</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
            <p className="text-xs text-gray-500">
              ${remainingUSD} remaining
            </p>
          </div>

          {/* Permission Details */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <DollarSign className="h-3 w-3" />
                Price per use
              </div>
              <p className="text-sm font-medium">${priceUSD}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Clock className="h-3 w-3" />
                Expires in
              </div>
              <p className="text-sm font-medium">{daysRemaining} days</p>
            </div>
          </div>

          {/* Session Account */}
          {sessionAccountAddress && (
            <div className="pt-2 border-t border-gray-800">
              <p className="text-xs text-gray-400 mb-1">Session Account</p>
              <code className="text-xs bg-gray-900/50 px-2 py-1 rounded">
                {sessionAccountAddress.slice(0, 6)}...{sessionAccountAddress.slice(-4)}
              </code>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // If no permission or expired - show request UI
  return (
    <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
      <CardHeader>
        <div className="flex items-center gap-3">
          {serviceIcon}
          <div>
            <CardTitle className="text-lg">{serviceName}</CardTitle>
            <CardDescription>{serviceDescription}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Permission Benefits */}
        <Alert className="bg-blue-500/10 border-blue-500/20">
          <Sparkles className="h-4 w-4 text-blue-400" />
          <AlertDescription className="text-sm">
            <strong>Enable seamless usage</strong>
            <br />
            Grant one-time permission to use this service without repeated confirmations
          </AlertDescription>
        </Alert>

        {/* Pricing Info */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
            <span className="text-sm text-gray-400">Price per use</span>
            <span className="text-lg font-bold">${priceUSD}</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
            <span className="text-sm text-gray-400">Monthly limit</span>
            <span className="text-lg font-bold">$10.00</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
            <span className="text-sm text-gray-400">Duration</span>
            <span className="text-lg font-bold">30 days</span>
          </div>
        </div>

        {/* Permission Features */}
        <div className="space-y-2 pt-2 border-t border-gray-800">
          <div className="flex items-start gap-2 text-sm">
            <Shield className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
            <span className="text-gray-300">Secure: Limited spending & time-bound</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
            <span className="text-gray-300">Convenient: No repeated signatures</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <AlertCircle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <span className="text-gray-300">Revocable: Cancel anytime</span>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        )}

        {/* Request Button */}
        <Button
          onClick={handleRequestPermission}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Requesting Permission...
            </>
          ) : (
            <>
              <Shield className="h-4 w-4 mr-2" />
              Grant Permission
            </>
          )}
        </Button>

        <p className="text-xs text-center text-gray-500">
          Requires MetaMask Flask 13.5.0+ with Smart Account
        </p>
      </CardContent>
    </Card>
  );
}
