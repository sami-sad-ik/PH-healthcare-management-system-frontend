export interface NavItems {
  title: string;
  href: string;
  icon: string;
}
export interface NavSection {
  title?: string;
  items: NavItems[];
}
