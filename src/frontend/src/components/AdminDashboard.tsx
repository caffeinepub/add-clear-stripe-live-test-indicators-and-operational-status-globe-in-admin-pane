import { useIsAdmin } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, CreditCard, AlertTriangle, Loader2, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminStripeConfig from './AdminStripeConfig';
import CampaignBuilder from './CampaignBuilder';

export default function AdminDashboard() {
  const { data: isAdmin, isLoading } = useIsAdmin();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 py-12">
        <div className="container px-4 max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground">Verifying admin access...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 py-12">
        <div className="container px-4 max-w-4xl mx-auto">
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Access Denied
              </CardTitle>
              <CardDescription>
                You do not have permission to access the admin dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This area is restricted to administrators only. If you believe you should have access, please contact your system administrator.
                </AlertDescription>
              </Alert>
              <Button onClick={() => window.history.back()} variant="outline">
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 py-8 sm:py-12">
      <div className="container px-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                System configuration and campaign management
              </p>
            </div>
          </div>
        </div>

        {/* Admin Tabs */}
        <Tabs defaultValue="campaigns" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 h-auto">
            <TabsTrigger value="campaigns" className="gap-2">
              <Rocket className="h-4 w-4" />
              Campaigns
            </TabsTrigger>
            <TabsTrigger value="stripe" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Stripe Config
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2" disabled>
              <Shield className="h-4 w-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2" disabled>
              <Shield className="h-4 w-4" />
              Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns">
            <CampaignBuilder />
          </TabsContent>

          <TabsContent value="stripe">
            <AdminStripeConfig />
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Coming soon</CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Coming soon</CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
