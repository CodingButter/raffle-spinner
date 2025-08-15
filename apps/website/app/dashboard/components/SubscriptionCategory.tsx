'use client';

import { CheckCircle2, XCircle } from 'lucide-react';
import { SubscriptionCategoryProps } from './types';

export function SubscriptionCategory({ title, subscriptions, color }: SubscriptionCategoryProps) {
  return (
    <div>
      <h4 className={`text-sm font-semibold text-${color}-400 mb-2`}>{title}</h4>
      {subscriptions.map((sub: any) => (
        <div
          key={sub.id}
          className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg mb-2"
        >
          <div>
            <p className="font-medium">{sub.product?.tier?.key || 'Subscription'}</p>
            <p className="text-sm text-gray-400">
              Status: {sub.status === 'active' ? 'Active' : sub.status}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {sub.status === 'active' || sub.status === 'trialing' ? (
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
