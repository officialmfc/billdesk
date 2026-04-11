"use client";

export default function OfflinePage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="text-center">
                <div className="mb-4 text-6xl">📡</div>
                <h1 className="mb-2 text-2xl font-bold">You're Offline</h1>
                <p className="mb-6 text-muted-foreground">
                    Please check your internet connection and try again.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
                >
                    Retry
                </button>
            </div>
        </div>
    );
}
