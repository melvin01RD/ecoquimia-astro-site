// Middleware to permanently redirect obsolete /services routes to /servicios
// Covers both /services and /services/ (permanent 301)

export async function onRequest(context: { url: URL }, next: any) {
  const { url } = context;
  const path = url.pathname;
  if (path === "/services" || path === "/services/") {
    // Permanent redirect to the new Spanish route
    return Response.redirect('/servicios', 301);
  }

  // Continue the request lifecycle for other routes
  return await next();
}
