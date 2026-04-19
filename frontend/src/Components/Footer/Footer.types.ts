export interface FooterLink {
    label: string;
    href: string;
}

export interface FooterProps {
    dark?: boolean;
    links?: FooterLink[];
}