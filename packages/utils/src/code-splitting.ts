/**
 * Code Splitting Utilities
 * Dynamic imports and lazy loading helpers
 */

/**
 * Lazy load a module with retry logic
 */
export async function lazyLoadWithRetry<T>(
    importFn: () => Promise<T>,
    retries = 3,
    delay = 1000
): Promise<T> {
    for (let i = 0; i < retries; i++) {
        try {
            return await importFn();
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }
    throw new Error('Failed to load module');
}

/**
 * Preload a module
 */
export function preloadModule(importFn: () => Promise<any>): void {
    // Start loading but don't wait
    importFn().catch((error) => {
        console.warn('Failed to preload module:', error);
    });
}

/**
 * Lazy load multiple modules in parallel
 */
export async function lazyLoadParallel<T extends Record<string, () => Promise<any>>>(
    modules: T
): Promise<{ [K in keyof T]: Awaited<ReturnType<T[K]>> }> {
    const entries = Object.entries(modules);
    const results = await Promise.all(entries.map(([, importFn]) => importFn()));

    return Object.fromEntries(
        entries.map(([key], index) => [key, results[index]])
    ) as any;
}

/**
 * Route-based code splitting helper
 */
export interface RouteConfig {
    path: string;
    component: () => Promise<any>;
    preload?: boolean;
}

export class RouteSplitter {
    private routes: Map<string, RouteConfig> = new Map();
    private loadedModules: Map<string, any> = new Map();

    /**
     * Register a route
     */
    register(config: RouteConfig): void {
        this.routes.set(config.path, config);

        if (config.preload) {
            preloadModule(config.component);
        }
    }

    /**
     * Load route component
     */
    async load(path: string): Promise<any> {
        // Check cache
        if (this.loadedModules.has(path)) {
            return this.loadedModules.get(path);
        }

        const route = this.routes.get(path);
        if (!route) {
            throw new Error(`Route not found: ${path}`);
        }

        const module = await lazyLoadWithRetry(route.component);
        this.loadedModules.set(path, module);
        return module;
    }

    /**
     * Preload routes
     */
    preloadRoutes(paths: string[]): void {
        paths.forEach((path) => {
            const route = this.routes.get(path);
            if (route) {
                preloadModule(route.component);
            }
        });
    }

    /**
     * Clear cache
     */
    clearCache(): void {
        this.loadedModules.clear();
    }
}

/**
 * Component-based code splitting
 */
export interface ComponentConfig {
    name: string;
    loader: () => Promise<any>;
    fallback?: any;
}

export class ComponentSplitter {
    private components: Map<string, ComponentConfig> = new Map();
    private loadedComponents: Map<string, any> = new Map();

    /**
     * Register a component
     */
    register(config: ComponentConfig): void {
        this.components.set(config.name, config);
    }

    /**
     * Load component
     */
    async load(name: string): Promise<any> {
        // Check cache
        if (this.loadedComponents.has(name)) {
            return this.loadedComponents.get(name);
        }

        const config = this.components.get(name);
        if (!config) {
            throw new Error(`Component not found: ${name}`);
        }

        try {
            const component = await lazyLoadWithRetry(config.loader);
            this.loadedComponents.set(name, component);
            return component;
        } catch (error) {
            console.error(`Failed to load component ${name}:`, error);
            return config.fallback;
        }
    }

    /**
     * Preload components
     */
    preload(names: string[]): void {
        names.forEach((name) => {
            const config = this.components.get(name);
            if (config) {
                preloadModule(config.loader);
            }
        });
    }
}

/**
 * Bundle size analyzer helper
 */
export interface BundleInfo {
    name: string;
    size: number;
    gzipSize?: number;
}

export function analyzeBundleSize(bundles: BundleInfo[]): {
    total: number;
    largest: BundleInfo;
    smallest: BundleInfo;
    average: number;
} {
    const total = bundles.reduce((sum, b) => sum + b.size, 0);
    const largest = bundles.reduce((max, b) => (b.size > max.size ? b : max));
    const smallest = bundles.reduce((min, b) => (b.size < min.size ? b : min));
    const average = total / bundles.length;

    return { total, largest, smallest, average };
}

/**
 * Chunk loading strategy
 */
export type LoadingStrategy = 'eager' | 'lazy' | 'prefetch' | 'preload';

export function getLoadingStrategy(
    priority: 'high' | 'medium' | 'low',
    userConnection?: 'slow' | 'fast'
): LoadingStrategy {
    if (priority === 'high') return 'eager';
    if (priority === 'low') return 'lazy';

    // Medium priority - depends on connection
    if (userConnection === 'slow') return 'lazy';
    return 'prefetch';
}
