import dotenv from 'dotenv';
dotenv.config();

async function testFacebookConnection() {
  const pageId = process.env.FB_PAGE_ID;
  const token = process.env.FB_PAGE_ACCESS_TOKEN;
  const version = process.env.FB_API_VERSION || 'v19.0';

  console.log('--- Testing Facebook Meta Graph API Connection ---');

  if (!pageId || !token) {
    console.error('❌ Error: FB_PAGE_ID or FB_PAGE_ACCESS_TOKEN is not set in backend/.env');
    console.log('Current FB_PAGE_ID:', pageId ? 'Set' : 'Empty');
    console.log('Current FB_PAGE_ACCESS_TOKEN:', token ? 'Set (length: ' + token.length + ')' : 'Empty');
    process.exit(1);
  }

  try {
    // 1. Test fetching Page Info
    console.log(`📡 Fetching page details for Page ID: ${pageId}...`);
    const pageUrl = `https://graph.facebook.com/${version}/${pageId}?fields=id,name,link&access_token=${token}`;
    const pageRes = await fetch(pageUrl);
    const pageData = (await pageRes.json()) as { id?: string; name?: string; link?: string; error?: { message: string } };

    if (!pageRes.ok || pageData.error) {
      console.error('❌ Meta Graph API Error:', pageData.error?.message || pageRes.statusText);
      process.exit(1);
    }

    console.log('✅ Connected to Facebook Page successfully!');
    console.log(`   Page Name: ${pageData.name}`);
    console.log(`   Page ID:   ${pageData.id}`);
    if (pageData.link) console.log(`   Page Link: ${pageData.link}`);

    // 2. Check token permissions
    console.log('\n📡 Checking token permissions...');
    const debugUrl = `https://graph.facebook.com/${version}/me/permissions?access_token=${token}`;
    const permRes = await fetch(debugUrl);
    const permData = (await permRes.json()) as { data?: Array<{ permission: string; status: string }> };

    if (permData.data) {
      const activePerms = permData.data.filter((p) => p.status === 'granted').map((p) => p.permission);
      console.log('Granted permissions:', activePerms.join(', '));
      const canPost = activePerms.includes('pages_manage_posts');
      if (canPost) {
        console.log('✅ Has "pages_manage_posts" permission! Publishing is ready to work.');
      } else {
        console.warn('⚠️ Warning: "pages_manage_posts" is NOT granted. Publishing thoughts will fail until this permission is added.');
      }
    }
  } catch (err) {
    console.error('❌ Network error during connection:', err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

testFacebookConnection();
