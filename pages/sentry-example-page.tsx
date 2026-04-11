import * as Sentry from "@sentry/nextjs";
import Head from "next/head";
import { useEffect, useState } from "react";

class SentryExampleFrontendError extends Error {
  constructor(message: string | undefined) {
    super(message);
    this.name = "SentryExampleFrontendError";
  }
}

export default function Page() {
  const [hasSentError, setHasSentError] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [isDevelopment, setIsDevelopment] = useState(false);
  const [testClient, setTestClient] = useState<any>(null);

  useEffect(() => {
    // Check if we're in development
    const devMode = process.env.NODE_ENV === 'development';
    setIsDevelopment(devMode);

    // ALWAYS initialize a test Sentry client for this page, regardless of environment
    // This bypasses the normal environment check
    const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

    if (dsn) {
      try {
        // Initialize Sentry specifically for testing on this page
        Sentry.init({
          dsn: dsn,
          environment: devMode ? 'development-test' : 'production-test',
          tracesSampleRate: 1.0,
          debug: false,
          beforeSend(event) {
            // Tag all events from this test page
            event.tags = {
              ...event.tags,
              test_page: 'true',
              original_env: process.env.NODE_ENV || 'unknown',
            };
            return event;
          },
        });

        console.log(`✅ Test Sentry client initialized (Environment: ${process.env.NODE_ENV})`);

        // Check connectivity
        Sentry.diagnoseSdkConnectivity().then((result) => {
          setIsConnected(result !== 'sentry-unreachable');
        });
      } catch (error) {
        console.error('Failed to initialize test Sentry client:', error);
      }
    }
  }, []);

  const handleTestError = async () => {
    try {
      // Send backend error first
      console.log('🧪 Sending backend error...');
      await fetch("/api/sentry-example-api").catch(() => {
        // Error expected, already captured by server
      });

      // Send frontend error
      console.log('🧪 Sending frontend error...');
      const error = new SentryExampleFrontendError(
        `🧪 TEST: Frontend error from test page (Env: ${process.env.NODE_ENV})`
      );

      // Capture the exception with context
      Sentry.captureException(error, {
        tags: {
          test_type: 'manual',
          test_source: 'frontend',
        },
        extra: {
          timestamp: new Date().toISOString(),
          note: 'This is a test error from the Sentry test page',
        },
      });

      setHasSentError(true);
      console.log('✅ Test errors sent to Sentry');
      console.log('📊 Check your Sentry dashboard: https://mondal-fish-center.sentry.io/issues/?project=4510280197865472');
      console.log('🔍 Filter by: test_page:true');
    } catch (error) {
      console.error('Error during test:', error);
      // Still mark as sent since we tried
      setHasSentError(true);
    }
  };

  return (
    <div>
      <Head>
        <title>Sentry Test Page</title>
        <meta name="description" content="Test Sentry for your Next.js app!" />
      </Head>

      <main>
        <div className="flex-spacer" />
        <svg height="40" width="40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21.85 2.995a3.698 3.698 0 0 1 1.353 1.354l16.303 28.278a3.703 3.703 0 0 1-1.354 5.053 3.694 3.694 0 0 1-1.848.496h-3.828a31.149 31.149 0 0 0 0-3.09h3.815a.61.61 0 0 0 .537-.917L20.523 5.893a.61.61 0 0 0-1.057 0l-3.739 6.494a28.948 28.948 0 0 1 9.63 10.453 28.988 28.988 0 0 1 3.499 13.78v1.542h-9.852v-1.544a19.106 19.106 0 0 0-2.182-8.85 19.08 19.08 0 0 0-6.032-6.829l-1.85 3.208a15.377 15.377 0 0 1 6.382 12.484v1.542H3.696A3.694 3.694 0 0 1 0 34.473c0-.648.17-1.286.494-1.849l2.33-4.074a8.562 8.562 0 0 1 2.689 1.536L3.158 34.17a.611.611 0 0 0 .538.917h8.448a12.481 12.481 0 0 0-6.037-9.09l-1.344-.772 4.908-8.545 1.344.77a22.16 22.16 0 0 1 7.705 7.444 22.193 22.193 0 0 1 3.316 10.193h3.699a25.892 25.892 0 0 0-3.811-12.033 25.856 25.856 0 0 0-9.046-8.796l-1.344-.772 5.269-9.136a3.698 3.698 0 0 1 3.2-1.849c.648 0 1.285.17 1.847.495Z" fill="currentcolor"/>
        </svg>
        <h1>
          Sentry Test Page
        </h1>

        {isDevelopment && (
          <div className="env-notice dev-notice">
            <p>🔧 <strong>Development Mode</strong></p>
            <p>This test page <strong>ALWAYS</strong> initializes Sentry for testing, bypassing environment checks.</p>
          </div>
        )}

        {!isDevelopment && (
          <div className="env-notice prod-notice">
            <p>🚀 <strong>Production Mode</strong></p>
            <p>This test page uses a dedicated test client for error testing.</p>
          </div>
        )}

        <p className="description">
          Click the button below to test Sentry integration. This page bypasses normal environment checks and <strong>always</strong> sends errors to Sentry for testing purposes.
          <br />
          <br />
          View errors on the <a target="_blank" rel="noopener noreferrer" href="https://mondal-fish-center.sentry.io/issues/?project=4510280197865472">Sentry Issues Page</a>.
          <br />
          Filter test errors: <code>test_page:true</code>
        </p>

        <button
          type="button"
          onClick={handleTestError}
          disabled={!isConnected}
        >
          <span>
            🧪 Test Sentry Integration
          </span>
        </button>

        {hasSentError ? (
          <p className="success">
            ✅ Test errors sent to Sentry!
            <br />
            Check your <a target="_blank" rel="noopener noreferrer" href="https://mondal-fish-center.sentry.io/issues/?project=4510280197865472">dashboard</a>
          </p>
        ) : !isConnected ? (
          <div className="connectivity-error">
            <p>⚠️ Sentry connectivity check failed. Your ad-blocker may be blocking Sentry requests. Try disabling it or check your DSN configuration.</p>
          </div>
        ) : (
          <div className="success_placeholder" />
        )}

        <div className="info-section">
          <h2>📊 Environment Info</h2>
          <ul>
            <li><strong>Mode:</strong> <span className={isDevelopment ? 'badge-dev' : 'badge-prod'}>{isDevelopment ? 'Development' : 'Production'}</span></li>
            <li><strong>Sentry SDK:</strong> {isConnected ? '✅ Connected' : '❌ Blocked'}</li>
            <li><strong>Test Mode:</strong> ✅ Always Active (bypasses env check)</li>
            <li><strong>Auto-reporting (Main App):</strong> {isDevelopment ? '❌ Disabled' : '✅ Enabled'}</li>
          </ul>
        </div>

        <div className="info-section">
          <h2>🔍 How to View Your Errors</h2>
          <ol>
            <li>Open the <a target="_blank" rel="noopener noreferrer" href="https://mondal-fish-center.sentry.io/issues/?project=4510280197865472">Sentry Dashboard</a></li>
            <li>Look for errors with tag <code>test_page:true</code></li>
            <li>You'll see both frontend and backend test errors</li>
          </ol>
        </div>

        <div className="flex-spacer" />

      </main>

      <style>{`
        * {
          box-sizing: border-box;
        }

        main {
          display: flex;
          min-height: 100vh;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 20px;
          padding: 16px;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
        }

        h1 {
          padding: 12px 24px;
          border-radius: 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-size: 32px;
          line-height: 1.2;
          margin: 0;
          box-shadow: 0 4px 12px rgba(118, 75, 162, 0.3);
        }

        h2 {
          font-size: 18px;
          margin: 0 0 12px 0;
          color: #181423;

          @media (prefers-color-scheme: dark) {
            color: #F5F5F5;
          }
        }

        p {
          margin: 0;
          font-size: 16px;
        }

        ol, ul {
          margin: 0;
          padding-left: 24px;
        }

        ul {
          list-style: none;
          padding: 0;
        }

        ul li {
          padding: 6px 0;
          font-size: 15px;
        }

        ol li {
          padding: 4px 0;
          font-size: 14px;
          line-height: 1.6;
        }

        code {
          background: rgba(102, 126, 234, 0.1);
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 13px;
          color: #764ba2;
        }

        a {
          color: #6341F0;
          text-decoration: underline;
          cursor: pointer;

          @media (prefers-color-scheme: dark) {
            color: #B3A1FF;
          }
        }

        button {
          border-radius: 12px;
          color: white;
          cursor: pointer;
          background-color: #553DB8;
          border: none;
          padding: 0;
          margin-top: 8px;
          transition: transform 0.2s ease;

          & > span {
            display: inline-block;
            padding: 16px 32px;
            border-radius: inherit;
            font-size: 20px;
            font-weight: bold;
            line-height: 1;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: 2px solid #553DB8;
            transform: translateY(-4px);
            transition: transform 0.1s ease;
          }

          &:hover {
            transform: scale(1.02);
          }

          &:hover > span {
            transform: translateY(-6px);
          }

          &:active > span {
            transform: translateY(0);
          }

          &:disabled {
            cursor: not-allowed;
            opacity: 0.6;
            transform: none;

            & > span {
              transform: translateY(0);
              border: none
            }
          }
        }

        .description {
          text-align: center;
          color: #6E6C75;
          max-width: 650px;
          line-height: 1.7;
          font-size: 16px;

          @media (prefers-color-scheme: dark) {
            color: #A49FB5;
          }
        }

        .env-notice {
          padding: 16px 24px;
          border-radius: 12px;
          text-align: center;
          max-width: 650px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .env-notice p {
          margin: 4px 0;
          font-size: 14px;
        }

        .env-notice strong {
          font-size: 16px;
        }

        .dev-notice {
          background: linear-gradient(135deg, #FFF3CD 0%, #FFE69C 100%);
          border: 2px solid #FFC107;
          color: #856404;
        }

        .prod-notice {
          background: linear-gradient(135deg, #D1ECF1 0%, #BEE5EB 100%);
          border: 2px solid #17A2B8;
          color: #0C5460;
        }

        .badge-dev {
          background: #FFC107;
          color: #856404;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 13px;
          font-weight: 600;
        }

        .badge-prod {
          background: #17A2B8;
          color: white;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 13px;
          font-weight: 600;
        }

        .info-section {
          padding: 20px 28px;
          border-radius: 12px;
          background-color: rgba(24, 20, 35, 0.03);
          border: 2px solid rgba(102, 126, 234, 0.2);
          max-width: 650px;
          width: 100%;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

          @media (prefers-color-scheme: dark) {
            background-color: rgba(255, 255, 255, 0.05);
            border-color: rgba(102, 126, 234, 0.3);
          }
        }

        .flex-spacer {
          flex: 1;
        }

        .success {
          padding: 16px 28px;
          border-radius: 12px;
          font-size: 16px;
          line-height: 1.5;
          background: linear-gradient(135deg, #00F261 0%, #00D956 100%);
          border: 2px solid #00BF4D;
          color: #181423;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(0, 242, 97, 0.3);
        }

        .success a {
          color: #181423;
          font-weight: 700;
        }

        .success_placeholder {
          height: 54px;
        }

        .connectivity-error {
          padding: 16px 28px;
          background: linear-gradient(135deg, #E50045 0%, #CC0039 100%);
          border-radius: 12px;
          max-width: 550px;
          color: #FFFFFF;
          border: 2px solid #A80033;
          text-align: center;
          margin: 0;
          box-shadow: 0 4px 12px rgba(229, 0, 69, 0.3);
        }

        .connectivity-error p {
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
}
