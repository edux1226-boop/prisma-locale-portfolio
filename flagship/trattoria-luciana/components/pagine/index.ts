import type { Lingua, Pagina } from '@/lib/rotte';
import { Home } from './Home';
import { Storia } from './Storia';
import { Menu } from './Menu';
import { Mare } from './Mare';
import { Prenota } from './Prenota';
import { Contatti } from './Contatti';

export const PAGINE_COMPONENTI: Record<Pagina, (p: { lingua: Lingua }) => React.ReactNode> = {
  home: Home,
  storia: Storia,
  menu: Menu,
  mare: Mare,
  prenota: Prenota,
  contatti: Contatti,
};
