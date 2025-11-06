import { describe, expect, it } from "vitest";
import { InvalidRouteError, Route } from "../src/route";
import {
  BASE_URL,
  buildRoute,
  cloneRouteSource,
  homeRouteSource,
  parentWithUrlRouteSource,
  profileRouteSource
} from "./fixtures";

describe("Route", () => {
  it("throws when neither url nor children are provided", () => {
    expect(() => new Route({ id: "invalid" }, { baseUrl: BASE_URL })).toThrow(InvalidRouteError);
  });

  it("sets id, url, pattern, and preserves the original source", () => {
    const route = buildRoute(homeRouteSource);

    expect(route.id).toBe("home");
    expect(route.url).toBe("/");
    expect(route.pattern).toBeInstanceOf(URLPattern);
    expect(route.source.id).toBe("home");
  });

  it("builds hierarchical ids and urls when a parent is provided", () => {
    const parent = buildRoute(profileRouteSource);
    const childSource = cloneRouteSource({ id: "settings", url: "/settings" });
    const child = buildRoute(childSource, parent);

    expect(child.id).toBe("profile.settings");
    expect(child.url).toBe("/profiles/:username/settings");
    expect(child.pattern).toBeInstanceOf(URLPattern);
  });

  it("instantiates child routes when children are provided", () => {
    const route = buildRoute(parentWithUrlRouteSource);

    expect(route.children?.map((child) => child.id)).toEqual(["app.app-home", "app.app-details"]);
  });
});
