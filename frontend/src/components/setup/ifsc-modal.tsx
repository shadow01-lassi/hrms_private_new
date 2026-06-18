// importing client
import api from "@/lib/api";

// importing from react
import { useState, useEffect } from "react";
import { X, Search, Landmark, MapPin, Loader2, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface IfscFinderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (ifsc: string, bank: string, branch: string) => void;
    apiString: string;
}

/**
 * IfscFinderModal
 * 
 * A two-step modal to find IFSC code by selecting a bank and then a branch.
 * Efficiently handles large datasets by server-side filtering and debouncing.
 */
export function IfscFinderModal({ isOpen, onClose, onSelect, apiString = "/master" }: IfscFinderModalProps) {
    const [step, setStep] = useState<1 | 2>(1);
    const [banks, setBanks] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [selectedBank, setSelectedBank] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setSearch("");
            setSelectedBank(null);
            setBranches([]);

            const fetchBanks = async () => {
                setLoading(true);
                try {
                    const response = await api.get(apiString + "/banks");
                    setBanks(response.data.data);
                } catch (err) {
                    // console.error("[IfscFinder] Failed to fetch banks:", err);
                } finally {
                    setLoading(false);
                }
            };
            fetchBanks();
        }
    }, [isOpen]);

    // Handle branch search with debounce
    useEffect(() => {
        if (step === 2 && selectedBank) {
            const timer = setTimeout(async () => {
                setLoading(true);
                try {
                    const response = await api.get(apiString + `/banks/${selectedBank.id}/branches`, {
                        params: { q: search }
                    });
                    setBranches(response.data.data);
                } catch (err) {
                    // console.error("[IfscFinder] Failed to fetch branches:", err);
                } finally {
                    setLoading(false);
                }
            }, 300); // 300ms debounce
            return () => clearTimeout(timer);
        }
    }, [search, selectedBank, step]);

    const handleBankSelect = (bank: any) => {
        setSelectedBank(bank);
        setStep(2);
        setSearch("");
    };

    const handleBack = () => {
        setStep(1);
        setSelectedBank(null);
        setSearch("");
        setBranches([]);
    };

    if (!isOpen) return null;

    const filteredBanks = banks.filter(b =>
        b.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md w-[95vw] p-0 flex flex-col max-h-[85vh] gap-0 overflow-hidden border-border/50 rounded-2xl shadow-2xl [&>button]:hidden">
                {/* Header */}
                <DialogHeader className="p-4 border-b border-border flex flex-row items-center justify-between bg-background sticky top-0 z-10 m-0 space-y-0 text-left">
                    <div className="flex items-center gap-3 min-w-0">
                        {step === 2 && (
                            <button
                                onClick={handleBack}
                                className="p-2 hover:bg-muted rounded-lg transition-colors shrink-0"
                                title="Go back to bank selection"
                            >
                                <ChevronRight className="w-5 h-5 rotate-180 text-muted-foreground" />
                            </button>
                        )}
                        <div className="min-w-0">
                            <DialogTitle className="text-lg font-bold text-foreground">
                                {step === 1 ? "Select Your Bank" : "Select Branch"}
                            </DialogTitle>
                            {step === 2 && selectedBank && (
                                <p className="text-[10px] text-primary font-bold uppercase tracking-wider mt-1 truncate">{selectedBank.name}</p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-muted rounded-lg transition-colors shrink-0"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                </DialogHeader>

                {/* Search Bar */}
                <div className="p-4 bg-muted/30 border-b border-border shrink-0">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder={step === 1 ? "Search bank name (e.g. HDFC)..." : "Search branch location..."}
                            className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm text-foreground placeholder:text-muted-foreground"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                {/* List Content */}
                <div className="flex-1 overflow-y-auto min-h-[350px]">
                    {loading && (step === 2 || (step === 1 && banks.length === 0)) ? (
                        <div className="flex flex-col items-center justify-center p-20 text-muted-foreground">
                            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                            <p className="text-sm font-medium">Fetching details...</p>
                        </div>
                    ) : step === 1 ? (
                        <div className="divide-y divide-border/50">
                            {filteredBanks.map((bank) => (
                                <button
                                    key={bank.id}
                                    className="w-full p-4 flex items-center gap-4 hover:bg-primary/5 transition-colors text-left group"
                                    onClick={() => handleBankSelect(bank)}
                                >
                                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0">
                                        <Landmark className="w-5 h-5" />
                                    </div>
                                    <span className="font-semibold text-foreground text-sm flex-1">{bank.name}</span>
                                    <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary/70 transition-colors" />
                                </button>
                            ))}
                            {filteredBanks.length === 0 && (
                                <div className="p-20 text-center">
                                    <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Search className="w-8 h-8 text-muted-foreground/50" />
                                    </div>
                                    <p className="text-muted-foreground text-sm">No banks found matching "{search}"</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="divide-y divide-border/50">
                            {branches.map((branch, idx) => (
                                <button
                                    key={idx}
                                    className="w-full p-4 flex items-center gap-4 hover:bg-primary/5 transition-colors text-left group"
                                    onClick={() => onSelect(branch.ifsc, selectedBank.name, branch.branch)}
                                >
                                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-foreground text-sm truncate uppercase">{branch.branch}</p>
                                        <p className="text-xs text-primary font-mono mt-1 font-semibold">{branch.ifsc}</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary/70 transition-colors" />
                                </button>
                            ))}
                            {branches.length === 0 && (
                                <div className="p-20 text-center">
                                    <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <MapPin className="w-8 h-8 text-muted-foreground/50" />
                                    </div>
                                    <p className="text-muted-foreground text-sm">No branches found for "{search}"</p>
                                    <p className="text-xs text-muted-foreground/80 mt-1">Try a different keyword or check spelling</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Info */}
                <div className="px-4 py-3 bg-muted/40 border-t border-border flex items-center justify-between shrink-0">
                    <p className="text-[10px] text-muted-foreground font-medium">Data sourced via official records</p>
                    <button
                        onClick={onClose}
                        className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
                    >
                        Close
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
