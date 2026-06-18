import React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { APP_ICON, APP_NAME, USER_PRIVACY_POLICY, USER_TERMS_OF_SERVICE } from "@/lib/constants";

interface SocialAuthPromptProps {
    isOpen: boolean;
    onClose: () => void;
    username?: string;
}

const SocialAuthPrompt: React.FC<SocialAuthPromptProps> = ({ isOpen, onClose, username }) => {
    const navigate = useNavigate();

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[400px] border-none bg-background p-0 overflow-hidden rounded-[24px] shadow-2xl">
                <div className="flex flex-col items-center pt-10 pb-6 px-8 text-center">
                    {/* App Icon */}
                    <div className="w-16 h-16 bg-muted flex items-center justify-center rounded-[18px] mb-6 shadow-sm border border-border/50 overflow-hidden">
                        <img src={APP_ICON} alt={APP_NAME} className="w-10 h-10 object-contain" />
                    </div>

                    {/* Content */}
                    <DialogHeader className="space-y-2">
                        <DialogTitle className="text-[20px] font-bold tracking-tight text-foreground">
                            {username ? `Never miss a post from ${username}` : `Never miss a post`}
                        </DialogTitle>
                        <DialogDescription className="text-[14px] text-muted-foreground leading-relaxed">
                            Sign up for {APP_NAME} to stay in the loop and participate in the community discussion.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Actions */}
                    <div className="w-full space-y-3 mt-8">
                        <Button
                            onClick={() => navigate("/login")}
                            className="w-full rounded-full h-12 text-[15px] font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all active:scale-95"
                        >
                            Log In
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => navigate("/onboard")}
                            className="w-full rounded-full h-12 text-[15px] font-medium border-border/50 hover:bg-muted transition-all active:scale-95"
                        >
                            Onboard your society
                        </Button>
                    </div>
                </div>

                {/* Footer/Legal */}
                <div className="px-8 pb-8 pt-2 text-center">
                    <p className="text-[11px] text-muted-foreground leading-relaxed px-4">
                        By continuing, you agree to {APP_NAME}'s{" "}
                        <a href={USER_TERMS_OF_SERVICE} target="_blank" rel="noopener noreferrer" className="text-foreground hover:underline font-medium">Terms of Use</a>
                        {" "}and{" "}
                        <a href={USER_PRIVACY_POLICY} target="_blank" rel="noopener noreferrer" className="text-foreground hover:underline font-medium">Privacy Policy</a>.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default SocialAuthPrompt;
