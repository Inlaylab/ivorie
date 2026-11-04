// The playground scenes. Plain data: the server routes import it to prerender each preview.
export type Scene = 'dashboard' | 'sign-in' | 'settings' | 'team' | 'checkout';

/** What each scene is for, in one line: the components it shows and what to try. */
export const SCENES: { value: Scene; label: string; description: string }[] = [
  {
    value: 'dashboard',
    label: 'Dashboard',
    description: 'A product overview with stats, a chart, a table and forms. Deploy, Share and Delete open a dialog, a popover and an alert.',
  },
  { value: 'sign-in', label: 'Sign in', description: 'A sign-in card and the one-time code step after it. Buttons, fields, a checkbox and input OTP.' },
  { value: 'settings', label: 'Settings', description: 'Profile and notification settings in tabs. Text fields, a native select, switches, radios and a slider.' },
  { value: 'team', label: 'Team', description: 'A member list you can search and page through. Table, avatars, badges, row menus and pagination.' },
  { value: 'checkout', label: 'Checkout', description: 'A checkout form beside an order summary. Radio cards, a separator, and a confirm dialog behind Pay.' },
];
