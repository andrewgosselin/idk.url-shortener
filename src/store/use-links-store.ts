import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ShortLink {
  slug: string;
  url: string;
  shortUrl: string;
  createdAt: string;
  clicks: number;
  expiresAt?: string;
  hasPassword?: boolean;
}

interface LinksState {
  links: ShortLink[];
  addLink: (link: ShortLink) => void;
  removeLink: (slug: string) => void;
  updateClickCounts: (stats: { slug: string; clicks: number }[]) => void;
}

export const useLinksStore = create<LinksState>()(
  persist(
    (set) => ({
      links: [],
      addLink: (link) =>
        set((state) => ({
          links: [...state.links, link],
        })),
      removeLink: (slug) =>
        set((state) => ({
          links: state.links.filter((link) => link.slug !== slug),
        })),
      updateClickCounts: (stats) =>
        set((state) => ({
          links: state.links.map((link) => {
            const stat = stats.find((s) => s.slug === link.slug);
            return stat ? { ...link, clicks: stat.clicks } : link;
          }),
        })),
    }),
    {
      name: 'links-storage',
    }
  )
); 