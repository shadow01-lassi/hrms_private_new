import { usePageHistory } from "@/hooks/use-page-history";

export function PageHeading() {
    const { history } = usePageHistory();
    if (history.length === 0) return null;

    const currentParams = history[history.length - 1];

    return (
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight capitalize text-foreground truncate">
            {currentParams.label}
        </h1>
    );
}
