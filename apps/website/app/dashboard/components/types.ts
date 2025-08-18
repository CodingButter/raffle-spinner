export interface UserData {
  plan: string;
  trialEndsAt: string;
  usage: {
    draws: number;
    participants: number;
    lastDraw: string;
  };
}

export interface OverviewTabProps {
  userData: UserData;
  userTier: string;
  userSubscriptions: any;
  subscriptionsLoading: boolean;
  onDownloadExtension: () => void;
}

export interface QuickActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  content?: React.ReactNode;
  footer?: string;
}

export interface StatRowProps {
  label: string;
  value: string;
}

export interface ActiveSubscriptionsCardProps {
  subscriptions: any;
  loading: boolean;
}

export interface SubscriptionsListProps {
  subscriptions: any;
}

export interface SubscriptionCategoryProps {
  title: string;
  subscriptions: any[];
  color: string;
}
