import * as React from "react";
import { X, ChevronsUpDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface MultiSelectProps {
    options: { value: string; label: string }[];
    value: string[];
    onValueChange: (value: string[]) => void;
    placeholder?: string;
    maxCount?: number;
    className?: string;
}

export function MultiSelect({
    options,
    value,
    onValueChange,
    placeholder = "Select options",
    maxCount = 3,
    className,
}: MultiSelectProps) {
    const [open, setOpen] = React.useState(false);

    const handleUnselect = (item: string) => {
        onValueChange(value.filter((i) => i !== item));
    };

    const toggleOption = (option: string) => {
        const newValue = value.includes(option)
            ? value.filter((i) => i !== option)
            : [...value, option];
        onValueChange(newValue);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "w-full justify-between h-auto min-h-10 px-3 py-2",
                        className
                    )}
                >
                    <div className="flex flex-wrap gap-1 items-center">
                        {value.length > 0 ? (
                            <>
                                {value.slice(0, maxCount).map((val) => (
                                    <Badge
                                        key={val}
                                        variant="secondary"
                                        className="rounded-sm px-1 font-normal"
                                    >
                                        {options.find((o) => o.value === val)?.label}
                                        <button
                                            type="button"
                                            className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    handleUnselect(val);
                                                }
                                            }}
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }}
                                            onClick={() => handleUnselect(val)}
                                        >
                                            <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                        </button>
                                    </Badge>
                                ))}
                                {value.length > maxCount && (
                                    <Badge
                                        variant="secondary"
                                        className="rounded-sm px-1 font-normal text-muted-foreground"
                                    >
                                        +{value.length - maxCount} more
                                    </Badge>
                                )}
                            </>
                        ) : (
                            <span className="text-muted-foreground">{placeholder}</span>
                        )}
                    </div>
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
                <Command className="w-full">
                    <CommandInput placeholder="Search..." />
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandList>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    onSelect={() => toggleOption(option.value)}
                                >
                                    <Checkbox
                                        checked={value.includes(option.value)}
                                        className="mr-2"
                                    />
                                    <span>{option.label}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
