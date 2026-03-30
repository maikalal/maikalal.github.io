import { App } from '@/components/App.tsx';
import { ErrorBoundary } from '@/components/ErrorBoundary.tsx';

function ErrorBoundaryError({ error }: { error: unknown }) {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="text-center">
        <p className="text-lg mb-2">An unhandled error occurred:</p>
        <blockquote className="bg-base-200 p-4 rounded-lg">
          <code>
            {error instanceof Error
              ? error.message
              : typeof error === 'string'
                ? error
                : JSON.stringify(error)}
          </code>
        </blockquote>
      </div>
    </div>
  );
}

export function Root() {
  return (
    <ErrorBoundary fallback={ErrorBoundaryError}>
      <App />
    </ErrorBoundary>
  );
}
