'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@drawday/ui/card';
import { Button } from '@drawday/ui/button';
import { CreditCard, FileText, AlertCircle } from 'lucide-react';

interface ManagementCardsProps {
  user: any;
  onManage: () => void;
}

export function ManagementCards({ user, onManage }: ManagementCardsProps) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <PaymentMethodCard user={user} onManage={onManage} />
      <BillingHistoryCard user={user} onManage={onManage} />
    </div>
  );
}

function PaymentMethodCard({ user, onManage }: any) {
  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Payment Method
        </CardTitle>
        <CardDescription>Manage your payment methods and billing details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <div className="flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-gray-400" />
            <div className="flex-1">
              <p className="font-medium text-sm">
                {user?.stripe_customer_id ? 'Payment method on file' : 'No payment method'}
              </p>
              <p className="text-xs text-gray-400">
                {user?.stripe_customer_id
                  ? 'Update payment method in Stripe portal'
                  : 'Add a payment method to subscribe'}
              </p>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full border-gray-700"
          onClick={onManage}
          disabled={!user?.stripe_customer_id}
        >
          <CreditCard className="mr-2 w-4 h-4" />
          {user?.stripe_customer_id ? 'Update Payment Method' : 'Add Payment Method'}
        </Button>

        <p className="text-xs text-gray-500 text-center">Securely managed by Stripe</p>
      </CardContent>
    </Card>
  );
}

function BillingHistoryCard({ user, onManage }: any) {
  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Billing History
        </CardTitle>
        <CardDescription>View and download your invoices and receipts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-gray-400" />
            <div className="flex-1">
              <p className="font-medium text-sm">
                {user?.stripe_customer_id ? 'Invoices available' : 'No billing history'}
              </p>
              <p className="text-xs text-gray-400">
                {user?.stripe_customer_id
                  ? 'Download invoices and receipts'
                  : 'Billing history will appear after subscription'}
              </p>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full border-gray-700"
          onClick={onManage}
          disabled={!user?.stripe_customer_id}
        >
          <FileText className="mr-2 w-4 h-4" />
          View Billing History
        </Button>

        <p className="text-xs text-gray-500 text-center">
          Access complete billing history in Stripe portal
        </p>
      </CardContent>
    </Card>
  );
}
