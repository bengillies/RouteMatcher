import { describe, expect, it } from 'vitest';
import { DuplicateRouteError } from '../src/match';
import {
  backtrackingBranchesRouteSources,
  buildMatcher,
  buildUrl,
  duplicateIdSources,
  multiLevelUrlLessRouteSource,
  parentWithUrlRouteSource,
  parentWithoutUrlRouteSource,
  paramRouteSource,
  profileRouteSource,
  secondaryWildcardRouteSource,
  unmatchedChildRouteSource,
  wildcardRouteSource,
} from './fixtures';

describe('RouteMatcher', () => {
  it('returns null when no route matches a URL', () => {
    const matcher = buildMatcher([profileRouteSource]);
    expect(matcher.match(buildUrl('/nope'))).toBeNull();
  });

  it('matches a param route and exposes captured groups', () => {
    const matcher = buildMatcher([paramRouteSource]);
    const result = matcher.match(buildUrl('/foo/123'));

    expect(result).not.toBeNull();
    expect(result?.[0].route.id).toBe('param');
    expect(result?.[0].match?.pathname?.groups).toMatchObject({ bar: '123' });
  });

  it('returns the matching stack when parent and child patterns succeed', () => {
    const matcher = buildMatcher([parentWithUrlRouteSource]);
    const result = matcher.match(buildUrl('/app/details/42'));

    expect(result?.map((match) => match.route.id)).toEqual(['app', 'app.app-details']);
    expect(result?.[1].match?.pathname?.groups).toMatchObject({ id: '42' });
  });

  it('keeps the parent match when it has its own url but children fail', () => {
    const matcher = buildMatcher([unmatchedChildRouteSource]);
    const result = matcher.match(buildUrl('/parent/standalone'));

    expect(result?.map((match) => match.route.id)).toEqual(['parent-only']);
  });

  it('only matches a url-less parent when one of its children matches', () => {
    const matcher = buildMatcher([parentWithoutUrlRouteSource]);
    const successful = matcher.match(buildUrl('/group/abc'));
    const unsuccessful = matcher.match(buildUrl('/group'));

    expect(successful?.map((match) => match.route.id)).toEqual(['group', 'group.group-detail']);
    expect(successful?.[1].match?.pathname?.groups).toMatchObject({ id: 'abc' });
    expect(unsuccessful).toBeNull();
  });

  it('supports multi-level backtracking for url-less parents', () => {
    const matcher = buildMatcher([multiLevelUrlLessRouteSource]);
    const result = matcher.match(buildUrl('/multi/xyz'));

    expect(result?.map((match) => match.route.id)).toEqual([
      'level-one',
      'level-one.level-two',
      'level-one.level-two.level-three',
    ]);
    expect(result?.at(-1)?.match?.pathname?.groups).toMatchObject({ id: 'xyz' });
  });

  it('continues searching after backtracking when later routes can match', () => {
    const matcher = buildMatcher(backtrackingBranchesRouteSources);
    const result = matcher.match(buildUrl('/target/my-slug'));

    expect(result?.map((match) => match.route.id)).toEqual(['target']);
    expect(result?.[0].match?.pathname?.groups).toMatchObject({ slug: 'my-slug' });
  });

  it('only returns the first matching route among peers', () => {
    const matcher = buildMatcher([wildcardRouteSource, secondaryWildcardRouteSource]);
    const result = matcher.match(buildUrl('/app/something'));

    expect(result?.length).toBe(1);
    expect(result?.[0].route.id).toBe('wildcard');
  });

  it('exposes nested routes via the routes map', () => {
    const matcher = buildMatcher([parentWithUrlRouteSource]);

    expect(matcher.routesMap.get('app')).toBeDefined();
    expect(matcher.routesMap.get('app.app-details')).toBeDefined();
  });

  it('throws when duplicate route ids are provided', () => {
    expect(() => buildMatcher(duplicateIdSources)).toThrow(DuplicateRouteError);
  });
});
