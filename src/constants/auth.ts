export enum Subscription {
    STARTER = 'starter',
    PRO = 'pro',
    BUSINESS = 'business',
}

export type SubscriptionType = `${Subscription}`;

export const subscriptionList = Object.values(Subscription);
