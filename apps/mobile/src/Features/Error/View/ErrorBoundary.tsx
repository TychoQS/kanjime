import { Component, type ReactNode } from "react";

import { translate } from "../../../Shared/I18n";
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

/**
 * Returns the current document language or falls back to "en-US".
 */
function resolveLanguage(): string {
  return typeof document !== "undefined" && document.documentElement.lang
    ? document.documentElement.lang
    : "en-US";
}

/**
 * Captures uncontrolled React render errors and renders a controlled fallback.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  readonly state: ErrorBoundaryState = {
    hasError: false,
    message: translate(resolveLanguage(), "unexpectedError"),
    canContinue: true
  };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return {
      hasError: true,
      message: translate(resolveLanguage(), "unexpectedError"),
      canContinue: true
    };
  }

  componentDidCatch(error: Error): void {
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
          message: translate(resolveLanguage(), "unexpectedError"),
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
            message: translate(resolveLanguage(), "unexpectedError"),
            canContinue: true
          });
        }}
      />
    );
  }
}
