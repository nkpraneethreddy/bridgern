jest.mock('@expo/vector-icons', () => {
  const mockReact = require('react');
  const { Text } = require('react-native');
  const MockIcon = ({ name }: { name?: string }) =>
    mockReact.createElement(Text, null, name ?? 'icon');
  return {
    Ionicons: MockIcon,
  };
});
