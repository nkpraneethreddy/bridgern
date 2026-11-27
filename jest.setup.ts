jest.mock('@expo/vector-icons', () => {
  const mockReact = require('react');
  const { Text } = require('react-native');
  const MockIcon = ({ name }: { name?: string }) =>
    mockReact.createElement(Text, null, name ?? 'icon');
  return {
    Ionicons: MockIcon,
  };
});

jest.mock('react-native-purchases', () => {
  return {
    __esModule: true,
    default: {
      configure: jest.fn(),
      getOfferings: jest.fn().mockResolvedValue({ current: { availablePackages: [] } }),
      purchasePackage: jest.fn().mockResolvedValue({ customerInfo: { entitlements: { active: {} } } }),
      restorePurchases: jest.fn().mockResolvedValue({ entitlements: { active: {} } }),
      getCustomerInfo: jest.fn().mockResolvedValue({ entitlements: { active: {} } }),
    },
    PurchasesPackage: {},
  };
});
