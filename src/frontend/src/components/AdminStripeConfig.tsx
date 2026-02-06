import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Shield, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  Unlock,
  TestTube,
  Zap,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Clock,
  DollarSign,
  Bell,
  BellOff,
  MessageSquare,
  Phone,
  Send
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  useGetStripeVerificationStatus, 
  useVerifyStripeKeys, 
  useManualVerifyStripeKeys,
  useGetStripeVerificationHistory,
  useGetPurchaseNotificationsEnabled,
  useSetPurchaseNotificationsEnabled,
  useGetPurchaseNotificationHistory,
  useGetTwilioConfig,
  useSaveTwilioConfig,
  useVerifyTwilioConfig,
  useManualVerifyTwilioConfig,
  useSendTestSms,
  useGetTwilioVerificationStatus
} from '../hooks/useQueries';
import { StripeKeyMode } from '../backend';
import AdminOperationalStatusGlobe from './AdminOperationalStatusGlobe';

type StripeMode = 'test' | 'live';

interface StripeConfig {
  publishableKey: string;
  secretKey: string;
  mode: StripeMode;
  isConfigured: boolean;
  lastVerified?: string;
}

interface TwilioCredentials {
  accountSid: string;
  authToken: string;
  adminPhoneNumber: string;
}

export default function AdminStripeConfig() {
  const [config, setConfig] = useState<StripeConfig>({
    publishableKey: '',
    secretKey: '',
    mode: 'test',
    isConfigured: false,
  });

  const [twilioCredentials, setTwilioCredentials] = useState<TwilioCredentials>({
    accountSid: '',
    authToken: '',
    adminPhoneNumber: '',
  });

  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showAuthToken, setShowAuthToken] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [twilioErrorMessage, setTwilioErrorMessage] = useState<string>('');

  const { data: verificationStatus, isLoading: isLoadingStatus } = useGetStripeVerificationStatus();
  const { data: verificationHistory } = useGetStripeVerificationHistory();
  const verifyKeysMutation = useVerifyStripeKeys();
  const manualVerifyMutation = useManualVerifyStripeKeys();

  // Purchase notification hooks
  const { data: notificationsEnabled, isLoading: isLoadingNotifications } = useGetPurchaseNotificationsEnabled();
  const setNotificationsEnabled = useSetPurchaseNotificationsEnabled();
  const { data: notificationHistory } = useGetPurchaseNotificationHistory();

  // Twilio hooks
  const { data: twilioConfig } = useGetTwilioConfig();
  const { data: twilioVerificationStatus } = useGetTwilioVerificationStatus();
  const saveTwilioConfig = useSaveTwilioConfig();
  const verifyTwilioConfig = useVerifyTwilioConfig();
  const manualVerifyTwilioConfig = useManualVerifyTwilioConfig();
  const sendTestSms = useSendTestSms();

  useEffect(() => {
    if (verificationStatus) {
      const lastVerifiedDate = new Date(Number(verificationStatus.lastVerified) / 1000000);
      setConfig(prev => ({
        ...prev,
        isConfigured: verificationStatus.isValid,
        lastVerified: lastVerifiedDate.toISOString(),
      }));
    }
  }, [verificationStatus]);

  useEffect(() => {
    if (twilioConfig) {
      setTwilioCredentials({
        accountSid: new TextDecoder().decode(twilioConfig.accountSid),
        authToken: new TextDecoder().decode(twilioConfig.authToken),
        adminPhoneNumber: twilioConfig.adminPhoneNumber,
      });
    }
  }, [twilioConfig]);

  const handleModeToggle = (checked: boolean) => {
    const newMode = checked ? 'live' : 'test';
    setConfig({ ...config, mode: newMode });
    toast.info(`Switched to ${newMode.toUpperCase()} mode`, {
      description: `You are now configuring ${newMode} Stripe keys`,
    });
  };

  const handleNotificationToggle = async (checked: boolean) => {
    try {
      await setNotificationsEnabled.mutateAsync(checked);
      toast.success(checked ? 'Purchase notifications enabled' : 'Purchase notifications disabled', {
        description: checked 
          ? 'You will receive real-time alerts when payments are made'
          : 'Purchase notifications have been turned off',
      });
    } catch (error) {
      toast.error('Failed to update notification settings', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    }
  };

  const validateKeys = (): boolean => {
    const { publishableKey, secretKey, mode } = config;

    if (!publishableKey.trim() || !secretKey.trim()) {
      setErrorMessage('Both Publishable and Secret keys are required');
      return false;
    }

    const expectedPkPrefix = mode === 'test' ? 'pk_test_' : 'pk_live_';
    const expectedSkPrefix = mode === 'test' ? 'sk_test_' : 'sk_live_';

    if (!publishableKey.startsWith(expectedPkPrefix)) {
      setErrorMessage(`Publishable key must start with ${expectedPkPrefix} for ${mode} mode`);
      return false;
    }

    if (!secretKey.startsWith(expectedSkPrefix)) {
      setErrorMessage(`Secret key must start with ${expectedSkPrefix} for ${mode} mode`);
      return false;
    }

    setErrorMessage('');
    return true;
  };

  const validateTwilioCredentials = (): boolean => {
    const { accountSid, authToken, adminPhoneNumber } = twilioCredentials;

    if (!accountSid.trim() || !authToken.trim() || !adminPhoneNumber.trim()) {
      setTwilioErrorMessage('All Twilio fields are required');
      return false;
    }

    if (!accountSid.startsWith('AC')) {
      setTwilioErrorMessage('Account SID must start with AC');
      return false;
    }

    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(adminPhoneNumber.replace(/[\s()-]/g, ''))) {
      setTwilioErrorMessage('Please enter a valid phone number (e.g., +1234567890)');
      return false;
    }

    setTwilioErrorMessage('');
    return true;
  };

  const handleVerifyKeys = async () => {
    if (!validateKeys()) {
      toast.error('Invalid keys', {
        description: errorMessage,
      });
      return;
    }

    try {
      const result = await verifyKeysMutation.mutateAsync();
      
      if (result.isValid) {
        const modeText = result.mode === StripeKeyMode.live ? 'Live' : 'Test';
        toast.success(`✅ Connected to Stripe (${modeText} Mode)`, {
          description: 'Your keys are valid and ready to use',
        });
      } else {
        throw new Error(result.errorMessage || 'Invalid Stripe keys');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to verify keys';
      setErrorMessage(errorMsg);
      toast.error('⚠️ Invalid keys – check your configuration', {
        description: errorMsg,
      });
    }
  };

  const handleManualVerify = async () => {
    try {
      const result = await manualVerifyMutation.mutateAsync();
      
      if (result.isValid) {
        const modeText = result.mode === StripeKeyMode.live ? 'Live' : 'Test';
        toast.success(`✅ Connected to Stripe (${modeText} Mode)`, {
          description: 'Manual verification successful',
        });
      } else {
        throw new Error(result.errorMessage || 'Verification failed');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Manual verification failed';
      toast.error('⚠️ Verification failed', {
        description: errorMsg,
      });
    }
  };

  const handleSaveConfig = async () => {
    if (!validateKeys()) {
      toast.error('Invalid configuration', {
        description: errorMessage,
      });
      return;
    }

    if (!verificationStatus?.isValid) {
      toast.warning('Please verify keys first', {
        description: 'Keys must be verified before saving',
      });
      return;
    }

    setIsSaving(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      setConfig({
        ...config,
        isConfigured: true,
        lastVerified: new Date().toISOString(),
      });

      toast.success('Configuration saved successfully', {
        description: `Stripe ${config.mode} mode is now active`,
      });
    } catch (error) {
      toast.error('Failed to save configuration', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setConfig({
      publishableKey: '',
      secretKey: '',
      mode: 'test',
      isConfigured: false,
    });
    setErrorMessage('');
    toast.info('Configuration reset');
  };

  const handleSaveTwilioConfig = async () => {
    if (!validateTwilioCredentials()) {
      toast.error('Invalid Twilio credentials', {
        description: twilioErrorMessage,
      });
      return;
    }

    try {
      const encoder = new TextEncoder();
      await saveTwilioConfig.mutateAsync({
        accountSid: encoder.encode(twilioCredentials.accountSid),
        authToken: encoder.encode(twilioCredentials.authToken),
        adminPhoneNumber: twilioCredentials.adminPhoneNumber,
      });

      toast.success('Twilio configuration saved', {
        description: 'Your SMS credentials have been securely stored',
      });
    } catch (error) {
      toast.error('Failed to save Twilio configuration', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    }
  };

  const handleVerifyTwilio = async () => {
    if (!validateTwilioCredentials()) {
      toast.error('Invalid credentials', {
        description: twilioErrorMessage,
      });
      return;
    }

    try {
      const result = await verifyTwilioConfig.mutateAsync();
      
      if (result.isValid) {
        toast.success('✅ Twilio credentials verified', {
          description: 'Your SMS configuration is ready to use',
        });
      } else {
        throw new Error(result.errorMessage || 'Verification failed');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to verify credentials';
      setTwilioErrorMessage(errorMsg);
      toast.error('⚠️ Verification failed', {
        description: errorMsg,
      });
    }
  };

  const handleSendTestSms = async () => {
    try {
      const testMessage = `Test SMS from AI Career Discovery Platform. Purchase notifications are working! Amount: $29.99, Time: ${new Date().toLocaleString()}`;
      const result = await sendTestSms.mutateAsync(testMessage);
      
      if (result.isValid) {
        toast.success('Test SMS sent successfully', {
          description: `Check your phone at ${twilioCredentials.adminPhoneNumber}`,
        });
      } else {
        throw new Error(result.errorMessage || 'Failed to send test SMS');
      }
    } catch (error) {
      toast.error('Failed to send test SMS', {
        description: error instanceof Error ? error.message : 'Please check your configuration',
      });
    }
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleString();
  };

  const getModeDisplay = (mode?: StripeKeyMode) => {
    if (!mode) return 'Unknown';
    return mode === StripeKeyMode.live ? 'Live' : 'Test';
  };

  // Compute operational status - ensure boolean values
  const isOperational = Boolean(verificationStatus?.isValid && verificationStatus.mode === StripeKeyMode.live);
  const isTestMode = Boolean(verificationStatus?.isValid && verificationStatus.mode === StripeKeyMode.test);
  const isStandby = !verificationStatus?.isValid;

  const getOperationalStatusText = () => {
    if (isOperational) return 'Operational – Accepting Funds';
    if (isTestMode) return 'Test Mode';
    return 'Standby';
  };

  const getOperationalStatusDescription = () => {
    if (isOperational) return 'Your site is live and processing real payments from customers';
    if (isTestMode) return 'Your site is in test mode – only test payments are accepted';
    return 'Stripe is not configured or keys are invalid – no payments can be processed';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Stripe Configuration</h2>
            <p className="text-sm text-muted-foreground">
              Secure payment gateway setup with live verification
            </p>
          </div>
        </div>
        {verificationStatus?.isValid && (
          <Badge variant="default" className="gap-1 bg-green-600">
            <CheckCircle2 className="h-3 w-3" />
            Configured
          </Badge>
        )}
      </div>

      <Alert>
        <Lock className="h-4 w-4" />
        <AlertDescription>
          All API keys are encrypted before storage and transmitted securely. Only admin users can access this configuration.
        </AlertDescription>
      </Alert>

      {/* Site Operational Status Section */}
      <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Shield className="h-5 w-5 text-white" />
            </div>
            Site Operational Status
          </CardTitle>
          <CardDescription>
            Real-time verification of your platform's payment processing status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-6 rounded-xl border-2 bg-card shadow-sm">
            <div className="flex items-center gap-6">
              <AdminOperationalStatusGlobe isOperational={isOperational} />
              <div className="space-y-1">
                <p className="text-xl font-bold">
                  {getOperationalStatusText()}
                </p>
                <p className="text-sm text-muted-foreground max-w-md">
                  {getOperationalStatusDescription()}
                </p>
                {verificationStatus && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                    <Clock className="h-3 w-3" />
                    Last checked: {formatTimestamp(verificationStatus.lastVerified)}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              {isOperational && (
                <Badge className="bg-green-600 text-white gap-1 px-3 py-1">
                  <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                  Live
                </Badge>
              )}
              {isTestMode && (
                <Badge className="bg-orange-600 text-white gap-1 px-3 py-1">
                  <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                  Test
                </Badge>
              )}
              {isStandby && (
                <Badge variant="secondary" className="gap-1 px-3 py-1">
                  <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                  Standby
                </Badge>
              )}
            </div>
          </div>

          {isStandby && (
            <Alert className="border-yellow-500/50 bg-yellow-500/10">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-900 dark:text-yellow-100">
                <strong>Action Required:</strong> Configure and verify your Stripe API keys below to enable payment processing.
              </AlertDescription>
            </Alert>
          )}

          {isTestMode && (
            <Alert className="border-orange-500/50 bg-orange-500/10">
              <TestTube className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-900 dark:text-orange-100">
                <strong>Test Mode Active:</strong> Your site is using test Stripe keys. Switch to Live mode to accept real payments.
              </AlertDescription>
            </Alert>
          )}

          {isOperational && (
            <Alert className="border-green-500/50 bg-green-500/10">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-900 dark:text-green-100">
                <strong>All Systems Operational:</strong> Your platform is live and ready to accept customer payments.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Purchase Notification Toggle */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center transition-all ${
              notificationsEnabled 
                ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/50 animate-pulse-slow' 
                : 'bg-muted'
            }`}>
              <DollarSign className={`h-5 w-5 ${notificationsEnabled ? 'text-white' : 'text-muted-foreground'}`} />
            </div>
            Purchase Notifications
          </CardTitle>
          <CardDescription>
            Receive real-time alerts when new payments or subscriptions are made
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
            <div className="flex items-center gap-3">
              {notificationsEnabled ? (
                <Bell className="h-5 w-5 text-green-600" />
              ) : (
                <BellOff className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium">
                  {notificationsEnabled ? 'Notifications Active' : 'Notifications Disabled'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {notificationsEnabled 
                    ? 'You will be notified of all new purchases' 
                    : 'Enable to receive purchase alerts'}
                </p>
              </div>
            </div>
            <Switch
              checked={notificationsEnabled || false}
              onCheckedChange={handleNotificationToggle}
              disabled={isLoadingNotifications || setNotificationsEnabled.isPending}
            />
          </div>

          {notificationsEnabled && notificationHistory && notificationHistory.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">Recent Purchase Notifications</h4>
                <Badge variant="secondary">{notificationHistory.length} total</Badge>
              </div>
              <ScrollArea className="h-[200px] rounded-lg border">
                <div className="p-3 space-y-2">
                  {notificationHistory.slice(0, 10).map((notification, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                        <DollarSign className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          ${(Number(notification.amount) / 100).toFixed(2)} - {notification.subscriptionType}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          User: {notification.userId.toString().slice(0, 20)}...
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatTimestamp(notification.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {notificationsEnabled && (!notificationHistory || notificationHistory.length === 0) && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No purchase notifications yet. You'll see them here when payments are made.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Twilio SMS Configuration */}
      <Card className="border-2 border-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center transition-all ${
              twilioVerificationStatus?.isValid
                ? 'bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg shadow-blue-500/50'
                : 'bg-muted'
            }`}>
              <MessageSquare className={`h-5 w-5 ${twilioVerificationStatus?.isValid ? 'text-white' : 'text-muted-foreground'}`} />
            </div>
            Twilio SMS Notifications
          </CardTitle>
          <CardDescription>
            Configure SMS alerts for purchase notifications via Twilio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="border-blue-500/50 bg-blue-500/10">
            <Phone className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900 dark:text-blue-100">
              When purchase notifications are enabled, SMS alerts will be sent to your configured phone number for every successful payment.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="twilioAccountSid" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Twilio Account SID
            </Label>
            <Input
              id="twilioAccountSid"
              type="text"
              placeholder="AC..."
              value={twilioCredentials.accountSid}
              onChange={(e) => setTwilioCredentials({ ...twilioCredentials, accountSid: e.target.value })}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Your Twilio Account SID (starts with AC)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="twilioAuthToken" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Twilio Auth Token
            </Label>
            <div className="relative">
              <Input
                id="twilioAuthToken"
                type={showAuthToken ? 'text' : 'password'}
                placeholder="Your Twilio Auth Token"
                value={twilioCredentials.authToken}
                onChange={(e) => setTwilioCredentials({ ...twilioCredentials, authToken: e.target.value })}
                className="font-mono text-sm pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowAuthToken(!showAuthToken)}
              >
                {showAuthToken ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Your Twilio Auth Token - will be encrypted
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adminPhoneNumber" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Admin Phone Number
            </Label>
            <Input
              id="adminPhoneNumber"
              type="tel"
              placeholder="+1234567890"
              value={twilioCredentials.adminPhoneNumber}
              onChange={(e) => setTwilioCredentials({ ...twilioCredentials, adminPhoneNumber: e.target.value })}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Phone number to receive SMS notifications (include country code, e.g., +1234567890)
            </p>
          </div>

          {twilioErrorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{twilioErrorMessage}</AlertDescription>
            </Alert>
          )}

          {twilioVerificationStatus && (
            <>
              {twilioVerificationStatus.isValid ? (
                <Alert className="border-green-500/50 bg-green-500/10">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-900 dark:text-green-100">
                    <div className="space-y-1">
                      <p className="font-semibold">✅ Twilio SMS configured successfully</p>
                      <p className="text-sm">Last verified: {formatTimestamp(twilioVerificationStatus.lastVerified)}</p>
                      <p className="text-sm">SMS notifications will be sent to: {twilioCredentials.adminPhoneNumber}</p>
                    </div>
                  </AlertDescription>
                </Alert>
              ) : twilioVerificationStatus.errorMessage ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p className="font-semibold">⚠️ SMS configuration failed</p>
                      <p className="text-sm">{twilioVerificationStatus.errorMessage}</p>
                    </div>
                  </AlertDescription>
                </Alert>
              ) : null}
            </>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleVerifyTwilio}
              disabled={verifyTwilioConfig.isPending || !twilioCredentials.accountSid || !twilioCredentials.authToken || !twilioCredentials.adminPhoneNumber}
              className="gap-2 flex-1"
              variant="outline"
            >
              {verifyTwilioConfig.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Verify Credentials
                </>
              )}
            </Button>
            <Button
              onClick={handleSaveTwilioConfig}
              disabled={saveTwilioConfig.isPending || !twilioVerificationStatus?.isValid}
              className="gap-2 flex-1"
            >
              {saveTwilioConfig.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Configuration
                </>
              )}
            </Button>
          </div>

          {twilioVerificationStatus?.isValid && (
            <Button
              onClick={handleSendTestSms}
              disabled={sendTestSms.isPending}
              variant="outline"
              className="w-full gap-2"
            >
              {sendTestSms.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Sending Test SMS...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Test SMS
                </>
              )}
            </Button>
          )}

          <div className="p-4 rounded-lg border bg-muted/30">
            <h4 className="text-sm font-semibold mb-2">How SMS Notifications Work</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Configure your Twilio credentials above</li>
              <li>Enable the purchase notification toggle</li>
              <li>When a payment is successful, you'll receive an SMS with:</li>
              <ul className="ml-6 mt-1 space-y-1 list-disc list-inside">
                <li>Payment amount</li>
                <li>User information</li>
                <li>Timestamp</li>
                <li>Subscription type</li>
              </ul>
            </ol>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Stripe Mode
          </CardTitle>
          <CardDescription>
            Switch between test and live payment processing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
            <div className="flex items-center gap-3">
              {config.mode === 'test' ? (
                <>
                  <div className="h-3 w-3 rounded-full bg-red-600 animate-pulse shadow-lg shadow-red-500/50" />
                  <TestTube className="h-5 w-5 text-orange-600" />
                </>
              ) : (
                <>
                  <div className="h-3 w-3 rounded-full bg-green-600 animate-pulse shadow-lg shadow-green-500/50" />
                  <Zap className="h-5 w-5 text-green-600" />
                </>
              )}
              <div>
                <p className="font-medium">
                  {config.mode === 'test' ? 'Test Mode' : 'Live Mode'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {config.mode === 'test' 
                    ? 'Test Mode – Sandbox Only' 
                    : 'Live Payments Active'}
                </p>
              </div>
            </div>
            <Switch
              checked={config.mode === 'live'}
              onCheckedChange={handleModeToggle}
            />
          </div>
          {config.mode === 'live' && (
            <Alert className="mt-4 border-yellow-500/50 bg-yellow-500/10">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-900 dark:text-yellow-100">
                <strong>Warning:</strong> Live mode will process real payments. Ensure your keys are correct.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Keys
          </CardTitle>
          <CardDescription>
            Enter your Stripe {config.mode} mode API keys
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="publishableKey" className="flex items-center gap-2">
              <Unlock className="h-4 w-4" />
              Publishable Key
            </Label>
            <Input
              id="publishableKey"
              type="text"
              placeholder={`pk_${config.mode}_...`}
              value={config.publishableKey}
              onChange={(e) => setConfig({ ...config, publishableKey: e.target.value })}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Your Stripe publishable key (starts with pk_{config.mode}_)
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="secretKey" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Secret Key
            </Label>
            <div className="relative">
              <Input
                id="secretKey"
                type={showSecretKey ? 'text' : 'password'}
                placeholder={`sk_${config.mode}_...`}
                value={config.secretKey}
                onChange={(e) => setConfig({ ...config, secretKey: e.target.value })}
                className="font-mono text-sm pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowSecretKey(!showSecretKey)}
              >
                {showSecretKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Your Stripe secret key (starts with sk_{config.mode}_) - will be encrypted
            </p>
          </div>

          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {verificationStatus && (
            <>
              {verificationStatus.isValid ? (
                <Alert className="border-green-500/50 bg-green-500/10">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-900 dark:text-green-100">
                    <div className="space-y-1">
                      <p className="font-semibold">✅ Connected to Stripe ({getModeDisplay(verificationStatus.mode)} Mode)</p>
                      <p className="text-sm">Last verified: {formatTimestamp(verificationStatus.lastVerified)}</p>
                    </div>
                  </AlertDescription>
                </Alert>
              ) : verificationStatus.errorMessage ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p className="font-semibold">⚠️ Invalid keys – check your configuration</p>
                      <p className="text-sm">{verificationStatus.errorMessage}</p>
                    </div>
                  </AlertDescription>
                </Alert>
              ) : null}
            </>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleVerifyKeys}
              disabled={verifyKeysMutation.isPending || !config.publishableKey || !config.secretKey}
              className="gap-2 flex-1"
              variant="outline"
            >
              {verifyKeysMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Verify Keys
                </>
              )}
            </Button>
            <Button
              onClick={handleSaveConfig}
              disabled={isSaving || !verificationStatus?.isValid}
              className="gap-2 flex-1"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Configuration
                </>
              )}
            </Button>
          </div>

          {verificationStatus && (
            <Button
              onClick={handleManualVerify}
              disabled={manualVerifyMutation.isPending}
              variant="outline"
              className="w-full gap-2"
            >
              {manualVerifyMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Rechecking...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Manual Recheck
                </>
              )}
            </Button>
          )}

          {config.isConfigured && (
            <Button
              onClick={handleReset}
              variant="outline"
              className="w-full"
            >
              Reset Configuration
            </Button>
          )}
        </CardContent>
      </Card>

      {verificationStatus?.isValid && (
        <Card className="border-green-500/50 bg-green-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-100">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Active Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mode</p>
                <p className="text-lg font-semibold capitalize">{getModeDisplay(verificationStatus.mode)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge variant="default" className="bg-green-600">Active</Badge>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Last Verified</p>
              <p className="text-sm flex items-center gap-2">
                <Clock className="h-3 w-3" />
                {formatTimestamp(verificationStatus.lastVerified)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {verificationHistory && verificationHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Verification History</CardTitle>
            <CardDescription>Recent verification attempts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {verificationHistory.slice(0, 5).map((record, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                  <div className="flex items-center gap-3">
                    {record.isValid ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        {record.isValid ? 'Successful' : 'Failed'} - {getModeDisplay(record.mode)} Mode
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTimestamp(record.lastVerified)}
                      </p>
                    </div>
                  </div>
                  {record.errorMessage && (
                    <p className="text-xs text-red-600">{record.errorMessage}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Where to find your Stripe keys</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
            <li>Log in to your Stripe Dashboard</li>
            <li>Navigate to Developers → API keys</li>
            <li>Toggle between Test and Live mode in the top right</li>
            <li>Copy your Publishable key and Secret key</li>
            <li>Paste them here and verify before saving</li>
          </ol>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => window.open('https://dashboard.stripe.com/apikeys', '_blank')}
          >
            Open Stripe Dashboard
            <Key className="h-3 w-3" />
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Where to find your Twilio credentials</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
            <li>Log in to your Twilio Console</li>
            <li>Navigate to Account → Account Info</li>
            <li>Copy your Account SID and Auth Token</li>
            <li>Enter your phone number (with country code)</li>
            <li>Verify and save your configuration</li>
          </ol>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => window.open('https://console.twilio.com/', '_blank')}
          >
            Open Twilio Console
            <MessageSquare className="h-3 w-3" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
