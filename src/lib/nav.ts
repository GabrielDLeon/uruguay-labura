export interface NavLink {
  href: string;
  label: string;
  icon: string;
}

export interface NavSection {
  id: string;
  label: string;
  icon: string;
  links: NavLink[];
}

export const repoUrl = "https://github.com/GabrielDLeon/uruguay-labura";

export const navSections: NavSection[] = [
  {
    id: "empleos",
    label: "Empleos",
    icon: "keyline-icons:briefcase-fill",
    links: [
      {
        href: "/empleos",
        label: "Todos los llamados",
        icon: "keyline-icons:briefcase-fill",
      },
      {
        href: "/empleos/datos",
        label: "Datos",
        icon: "keyline-icons:chart-bar-fill",
      },
      {
        href: "/empleos/guardados",
        label: "Guardados",
        icon: "keyline-icons:bookmark-fill",
      },
    ],
  },
  {
    id: "educacion",
    label: "Educación",
    icon: "keyline-icons:graduation-cap-fill",
    links: [
      {
        href: "/educacion/carreras",
        label: "Carreras",
        icon: "keyline-icons:graduation-cap-fill",
      },
      {
        href: "/educacion/instituciones",
        label: "Instituciones",
        icon: "keyline-icons:landmark-fill",
      },
      {
        href: "/educacion/becas",
        label: "Becas",
        icon: "keyline-icons:hand-coins-fill",
      },
    ],
  },
];

export const projectLinks: NavLink[] = [
  {
    href: "/acerca",
    label: "Acerca del proyecto",
    icon: "keyline-icons:info-fill",
  },
  {
    href: repoUrl,
    label: "GitHub",
    icon: "mdi:github",
  },
  {
    href: `${repoUrl}/issues`,
    label: "Reportar un problema",
    icon: "keyline-icons:bug-fill",
  },
];
