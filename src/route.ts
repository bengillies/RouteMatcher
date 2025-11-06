export interface RouteSource {
  id: string;
  url?: string;
  children?: RouteSource[];
}

export interface RouteOptions {
  parent?: Route;
  baseUrl: string;
}

export class InvalidRouteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidRouteError';
  }
}

export class Route {
  declare id: string;
  declare url: string;
  declare pattern: URLPattern
  declare children?: Route[];
  declare source: RouteSource;

  constructor(source: RouteSource, opts: RouteOptions) {
    if (!source.url && !source.children) {
      throw new InvalidRouteError('A route must have either a URL pattern or child routes.');
    }

    this.source = source;
    this.id = this.#buildId(source.id, opts.parent?.id);

    const url = source.url ?? '/*';
    this.url = this.#buildURLStr(url, opts.parent?.url);
    this.pattern = new URLPattern(this.url, opts.baseUrl);

    if (source.children) {
      this.children = source.children.map(child => new Route(child, {
        parent: this,
        baseUrl: opts.baseUrl
      }));
    }
  }

  #buildURLStr(url: string, parentUrl?: string): string {
    if (!parentUrl) {
      return url;
    }

    const trimmedParent = parentUrl.replace(/\/?\*?$/, '');
    const trimmedUrl = url.replace(/^\//, '');

    return `${trimmedParent}/${trimmedUrl}`;
  }

  #buildId(id: string, parentId?: string): string {
    if (!parentId) {
      return id;
    }

    return `${parentId}.${id}`;
  }
}
