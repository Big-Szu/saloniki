import React from 'react';
import { View, Text, Button } from 'react-native';

interface Props {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback;
      if (Fallback && this.state.error) {
        return <Fallback error={this.state.error} resetError={this.resetError} />;
      }
      
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, marginBottom: 10 }}>Something went wrong!</Text>
          <Text style={{ marginBottom: 20 }}>{this.state.error?.message}</Text>
          <Button title="Try Again" onPress={this.resetError} />
        </View>
      );
    }

    return this.props.children;
  }
}