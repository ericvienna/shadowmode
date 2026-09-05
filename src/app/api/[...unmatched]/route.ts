import { NextResponse } from 'next/server';

/**
 * Catch-all for /api paths that match no real route.
 *
 * Next resolves static segments before this, so every endpoint in the OpenAPI
 * spec still wins. Anything left over is a wrong guess by a client — answer it
 * in JSON with a pointer to the spec, never an HTML error page. An agent cannot
 * parse the app shell, and a 200-with-shell would tell it every path exists.
 */

const DOCS = 'https://shadowmode.us/openapi.json';

function notFound(path: string) {
  return NextResponse.json(
    {
      error: 'not_found',
      message: `No API endpoint at /api/${path}.`,
      hint: `Fetch ${DOCS} for the list of available endpoints, or https://shadowmode.us/llms.txt for when to use each one.`,
      documentation: DOCS,
    },
    {
      status: 404,
      headers: {
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}

type Ctx = { params: Promise<{ unmatched: string[] }> };

async function handler(_request: Request, ctx: Ctx) {
  const { unmatched } = await ctx.params;
  return notFound(unmatched.join('/'));
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const HEAD = handler;
