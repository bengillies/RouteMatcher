import { Route, type RouteSource } from '../src/route';
import { RouteMatcher, type RouteMatcherOptions } from '../src/match';

export const BASE_URL = 'https://route-matcher.test';

export const homeRouteSource: RouteSource = {
  id: 'home',
  url: '/',
};

export const profileRouteSource: RouteSource = {
  id: 'profile',
  url: '/profiles/:username',
};

export const paramRouteSource: RouteSource = {
  id: 'param',
  url: '/foo/:bar',
};

export const parentWithUrlRouteSource: RouteSource = {
  id: 'app',
  url: '/app/*',
  children: [
    {
      id: 'app-home',
      url: '/',
    },
    {
      id: 'app-details',
      url: '/details/:id',
    },
  ],
};

export const parentWithoutUrlRouteSource: RouteSource = {
  id: 'group',
  children: [
    {
      id: 'group-detail',
      url: '/group/:id',
    },
  ],
};

export const unmatchedChildRouteSource: RouteSource = {
  id: 'parent-only',
  url: '/parent/*',
  children: [
    {
      id: 'parent-only-child',
      url: '/other',
    },
  ],
};

export const multiLevelUrlLessRouteSource: RouteSource = {
  id: 'level-one',
  children: [
    {
      id: 'level-two',
      children: [
        {
          id: 'level-three',
          url: '/multi/:id',
        },
      ],
    },
  ],
};

export const backtrackingBranchesRouteSources: RouteSource[] = [
  {
    id: 'dead-end',
    children: [
      {
        id: 'dead-end-child',
        url: '/dead/child',
      },
    ],
  },
  {
    id: 'target',
    url: '/target/:slug',
  },
];

export const wildcardRouteSource: RouteSource = {
  id: 'wildcard',
  url: '/app/:rest*',
};

export const secondaryWildcardRouteSource: RouteSource = {
  id: 'secondary',
  url: '/app/:rest*',
};

export const duplicateIdSources: RouteSource[] = [
  { id: 'duplicate', url: '/duplicate' },
  { id: 'duplicate', url: '/duplicate/again' },
];

export function cloneRouteSource(source: RouteSource): RouteSource {
  return {
    id: source.id,
    url: source.url,
    children: source.children?.map((child) => cloneRouteSource(child)),
  };
}

export function buildRoute(source: RouteSource, parent?: Route): Route {
  return new Route(cloneRouteSource(source), {
    parent,
    baseUrl: BASE_URL,
  });
}

export function buildMatcher(
  sources: RouteSource[],
  opts: Partial<RouteMatcherOptions> = {},
): RouteMatcher {
  return new RouteMatcher(sources.map(cloneRouteSource), {
    baseUrl: opts.baseUrl ?? BASE_URL,
  });
}

export function buildUrl(pathname: string): URL {
  return new URL(pathname, BASE_URL);
}
