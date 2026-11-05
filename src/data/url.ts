/** Percorso interno con il prefisso di pubblicazione (BASE_PATH, di default '/'). */
export const u = (p: string) => import.meta.env.BASE_URL.replace(/\/$/, '') + p;
