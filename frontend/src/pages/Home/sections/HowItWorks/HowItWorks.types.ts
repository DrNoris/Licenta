export interface Step {
    title: string;
    description: string;
}

export interface HowItWorksProps {
    heading?: string;
    steps?: Step[];
}