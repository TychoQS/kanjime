import { Component, type ErrorInfo, type ReactNode } from "react";

import { ErrorView } from "./ErrorView";

interface ErrorBoundaryProps {
  readonly children: ReactNode;
  readonly captureUnexpectedError: (
    error: Error
  ) => Promise<{ readonly message: string; readonly isControlled: boolean }>;
}

interface ErrorBoundaryState {
  readonly hasError: boolean;
  readonly message: string;
  readonly canContinue: boolean;
}

const DEFAULT_ERROR_MESSAGE = "An unexpected error has occurred. You can keep using the application.";

/**
 * Captures uncontrolled React render errors and renders a controlled fallback.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  readonly state: ErrorBoundaryState = {
    hasError: false,
    message: DEFAULT_ERROR_MESSAGE,
    canContinue: true
  };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return {
      hasError: true,
      message: DEFAULT_ERROR_MESSAGE,
      canContinue: true
    };
  }

  componentDidCatch(error: Error, _errorInfo: ErrorInfo): void {
    void this.props.captureUnexpectedError(error)
      .then(state => {
        this.setState({
          hasError: true,
          message: state.message,
          canContinue: state.isControlled
        });
      })
      .catch(() => {
        this.setState({
          hasError: true,
          message: DEFAULT_ERROR_MESSAGE,
          canContinue: true
        });
      });
  }

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <ErrorView
        isVisible
        message={this.state.message}
        canContinue={this.state.canContinue}
        onDismissRequested={() => {
          this.setState({
            hasError: false,
            message: DEFAULT_ERROR_MESSAGE,
            canContinue: true
          });
        }}
      />
    );
  }
}
