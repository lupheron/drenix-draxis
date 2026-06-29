export type NavItem = {
  id: string;
  label: string;
  href: string;
  description?: string;
};

export type NavSection = {
  id: string;
  title: string;
  items: NavItem[];
};
