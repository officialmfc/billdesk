export type SingleFlightRunner<TArgs extends unknown[], TResult> = (
  ...args: TArgs
) => Promise<TResult>;

export function createSingleFlight<TArgs extends unknown[], TResult>(
  operation: (...args: TArgs) => Promise<TResult>
): SingleFlightRunner<TArgs, TResult> {
  let pending: Promise<TResult> | null = null;

  return async (...args: TArgs): Promise<TResult> => {
    if (pending) {
      return pending;
    }

    pending = (async () => operation(...args))();

    try {
      return await pending;
    } finally {
      pending = null;
    }
  };
}
