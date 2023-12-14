import { NextResponse } from 'next/server';

import Sitemapper from 'sitemapper';

export async function POST(req: Request) {
  const { mainURL } = await req.json();

  try {
    if (!mainURL || mainURL === '') {
      return new NextResponse('website url not found', {
        status: 402,
      });
    }

    // this part fetches the sublinks of main url*
    const sitemap = new Sitemapper({
      url: `${mainURL}/sitemap.xml`,
    });
    const { sites } = await sitemap.fetch();

    return NextResponse.json(sites);
  } catch (error: any) {
    console.log('error', error);
    return new NextResponse('Something went wrong', { status: 500 });
  }
}
