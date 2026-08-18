/**
 * Centralized Links Configuration
 *
 * All external links used in the application.
 * Update these values to customize the boilerplate for your plugin.
 */

export const LINKS = {
  // ==========================================
  // PRODUCT & BRANDING
  // ==========================================
  website: 'https://your-website.com/',
  boilerplate: 'https://your-boilerplate-site.com',

  // ==========================================
  // LEGAL & POLICIES
  // ==========================================
  legal: {
    terms: 'https://your-website.com/terms',
    privacy: 'https://your-website.com/privacy',
    eula: 'https://your-website.com/eula',
  },

  // ==========================================
  // SUPPORT & CONTACT
  // ==========================================
  support: {
    email: 'support@your-domain.com',
    // Gmail compose URL is auto-generated from email
    getEmailComposeUrl: (email: string = 'support@your-domain.com') =>
      `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`,
  },

  // ==========================================
  // SOCIAL MEDIA
  // ==========================================
  social: {
    github: 'https://github.com/your-repo',
    githubDocs: 'https://github.com/your-repo/docs',
    youtube: 'https://youtube.com/@yourchannel',
    twitter: 'https://x.com/yourhandle',
    discord: 'https://discord.gg/yourinvite',
  },

  // ==========================================
  // POLAR.SH (Payment & Licensing)
  // ==========================================
  polar: {
    // Purchase link - Free trial or direct purchase
    purchase: 'https://buy.polar.sh/YOUR_CHECKOUT_LINK',

    // Customer portal for managing subscriptions
    portal: 'https://polar.sh/your-username/portal/',

    // Organization dashboard
    organization: 'https://polar.sh/your-username',
  },

  // ==========================================
  // DOCUMENTATION
  // ==========================================
  docs: {
    main: 'https://github.com/your-repo/docs',
    gettingStarted: 'https://github.com/your-repo/docs#getting-started',
    api: 'https://github.com/your-repo/docs/api',
    troubleshooting: 'https://github.com/your-repo/docs#troubleshooting',
  },

  // ==========================================
  // EXTERNAL SERVICES
  // ==========================================
  external: {
    // Google PageSpeed Insights API docs
    pageSpeedDocs: 'https://developers.google.com/speed/docs/insights/v5/get-started',

    // Framer
    framerDevelopers: 'https://www.framer.com/developers',
    framerPlugins: 'https://www.framer.com/developers/plugins',

    // Supabase
    supabaseDashboard: 'https://supabase.com/dashboard',
    supabaseDocs: 'https://supabase.com/docs',
  },
} as const;

/**
 * Type helper for link keys
 */
export type LinkKey = keyof typeof LINKS;

/**
 * Helper function to get a link safely
 */
export function getLink(path: string): string {
  const keys = path.split('.');
  let value: any = LINKS;

  for (const key of keys) {
    value = value[key];
    if (value === undefined) {
      console.warn(`[Links] Link not found for path: ${path}`);
      return '#';
    }
  }

  return typeof value === 'string' ? value : '#';
}

/**
 * Helper to open a link in a new tab
 */
export function openLink(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Helper to open a link from the config
 */
export function openConfigLink(path: string): void {
  const url = getLink(path);
  if (url !== '#') {
    openLink(url);
  }
}
