import { Route } from './route';
import type { RouteSource } from './route';

export type URLPatternMatch = ReturnType<URLPattern['exec']>;

export interface URLMatch {
  route: Route;
  match: URLPatternMatch;
}

export type MatchResult = URLMatch[];

export interface RouteMatcherOptions {
  baseUrl: string;
}

export class DuplicateRouteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DuplicateRouteError';
  }
}

export class RouteMatcher {
  declare routes: Route[];
  declare routesMap: Map<string, Route>;

  constructor(routes: RouteSource[], opts: RouteMatcherOptions) {
    this.routes = routes.map((route) => new Route(route, { baseUrl: opts.baseUrl }));

    this.routesMap = new Map();

    const addRoutes = (routes: Route[]) => {
      for (const route of routes) {
        this.#addRouteToMap(route);

        if (route.children) {
          addRoutes(route.children);
        }
      }
    };

    addRoutes(this.routes);
  }

  #addRouteToMap(route: Route) {
    if (this.routesMap.has(route.id)) {
      throw new DuplicateRouteError(`Duplicate route ID detected: ${route.id}`);
    }

    this.routesMap.set(route.id, route);
  }

  match(url: URL): MatchResult | null {
    const matches: MatchResult = [];

    const matchRoutes = (routes: Route[], depth: number): boolean => {
      for (const route of routes) {
        let matched = false;
        const match = route.pattern?.exec(url);

        if (match) {
          matched = true;
          matches.push({ route, match });

          if (route.children) {
            matched = matchRoutes(route.children, depth + 1);

            if (!matched) {
              continue;
            }
          }

          return true;
        }
      }

      if (depth && !matches[depth - 1]!.route.source.url) {
        matches.pop();
        return false;
      }

      return true;
    };

    matchRoutes(this.routes, 0);

    if (matches.length > 0) {
      return matches;
    }

    return null;
  }
}
