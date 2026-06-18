export default function AuthCheckSkeleton() {
    return (
        <>
            <div className="h-screen w-screen flex flex-col justify-center items-center bg-background">
                <div className="relative mb-8">
                    <img
                        src="/logo.svg"
                        alt="Logo"
                        className="h-16 w-auto animate-pulse"
                    />
                </div>

                <div className="text-center space-y-2">
                    <h2 className="text-xl font-semibold tracking-tight">Hang tight!</h2>
                    <p className="text-muted-foreground text-sm">We're preparing your workspace...</p>
                </div>
            </div>
        </>
    );
}