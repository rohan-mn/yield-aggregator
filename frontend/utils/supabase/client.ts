// frontend/utils/supabase/client.ts
import { createBrowserClient, type CookieOptions } from "@supabase/ssr";

// Make sure these env vars exist in your .env.local
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabaseClient = createBrowserClient(url, anonKey, {
  cookies: {
    get(name: string) {
      const cookie = document.cookie.split('; ').find((c) => c.trim().startsWith(`${name}=`));
      return cookie ? cookie.split('=')[1] : null;
    },
    set(name: string, value: string, options: CookieOptions) {
      let cookieString = `${name}=${value}`;

      // Add common cookie options
      if (options.path) cookieString += `; Path=${options.path}`;
      if (options.domain) cookieString += `; Domain=${options.domain}`;
      if (options.maxAge !== undefined) cookieString += `; Max-Age=${options.maxAge}`;
      if (options.expires) cookieString += `; Expires=${options.expires.toUTCString()}`;
      if (options.secure) cookieString += `; Secure`;
      if (options.sameSite) cookieString += `; SameSite=${options.sameSite}`;

      // Debugging: Explicitly set a common SameSite if not provided, or ensure Secure for 'None'
      // This is a common pitfall for local development
      if (!options.sameSite && options.secure) {
        // If secure but no sameSite, default to 'None' for cross-site (needs HTTPS)
        cookieString += `; SameSite=None`;
      } else if (!options.sameSite && !options.secure) {
        // If not secure and no sameSite, default to 'Lax' (common for HTTP)
        cookieString += `; SameSite=Lax`;
      }

      document.cookie = cookieString;
    },
    remove(name: string, options: CookieOptions) {
      let cookieString = `${name}=; Max-Age=0`; // Expire immediately

      if (options.path) cookieString += `; Path=${options.path}`;
      if (options.domain) cookieString += `; Domain=${options.domain}`;
      if (options.secure) cookieString += `; Secure`;
      if (options.sameSite) cookieString += `; SameSite=${options.sameSite}`;

      // Debugging: Ensure consistency with 'set'
      if (!options.sameSite && options.secure) {
        cookieString += `; SameSite=None`;
      } else if (!options.sameSite && !options.secure) {
        cookieString += `; SameSite=Lax`;
      }

      document.cookie = cookieString;
    },
  },
});
