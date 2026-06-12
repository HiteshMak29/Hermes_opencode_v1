import type { SourceService } from './types.ts';

const services = new Map<string, SourceService>();

export function registerService(service: SourceService): void {
  const types = Array.isArray(service.type) ? service.type : [service.type];
  for (const t of types) {
    if (services.has(t)) {
      console.warn(`[registry] Overwriting existing service for type '${t}'`);
    }
    services.set(t, service);
  }
}

export function getService(type: string): SourceService | undefined {
  return services.get(type);
}

export function getAllServices(): SourceService[] {
  return [...new Set(services.values())];
}
