// Dummy users for the demo sign-in. No backend / no real auth.
// Credentials are intentionally visible on the login screen for the demo.
//
// `password` is stripped before a user is exposed to the app (see authStore).
// `shippingAddress` is the saved default used to prefill checkout; it can be
// changed from the profile page or the shop_update_shipping_address tool.

export const dummyUsers = [
  {
    id: 'u-1',
    email: 'demo@contoso.com',
    password: 'contoso123',
    name: 'Alex Demo',
    phone: '+1 (555) 0134-772',
    memberSince: '2023-04-18',
    loyaltyTier: 'Gold',
    loyaltyPoints: 2480,
    shippingAddress: {
      name: 'Alex Demo',
      address: '742 Evergreen Terrace',
      city: 'Springfield',
      zip: '62704',
      country: 'United States',
    },
    preferences: {
      newsletter: true,
      smsUpdates: false,
      favouriteCategory: 'Running',
    },
  },
  {
    id: 'u-2',
    email: 'jordan@contoso.com',
    password: 'sports456',
    name: 'Jordan Fields',
    phone: '+1 (555) 0198-410',
    memberSince: '2025-01-09',
    loyaltyTier: 'Silver',
    loyaltyPoints: 640,
    shippingAddress: {
      name: 'Jordan Fields',
      address: '18 Harbour Way, Apt 5C',
      city: 'Boston',
      zip: '02101',
      country: 'United States',
    },
    preferences: {
      newsletter: false,
      smsUpdates: true,
      favouriteCategory: 'Cycling',
    },
  },
]
