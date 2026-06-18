// importing from react
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// importing shadcn components
import { Button } from "@/components/ui/button";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";

// importing components
import { NavLogo } from "@/components/navbar/nav-logo";

// importing constants, types, utilits and others
import {
    APP_SIDEBAR_PARENT_LINK,
    NAV_SEARCH_KEYBOARD_KEY
} from "@/lib/constants";
import { MenuItemType, SidebarItemsType } from "@/lib/types";
import { nestMenuData } from "@/lib/utils";

interface FlattenedItem {
    group: string;
    label: string;
    path: string;
    value: string;
}

export function NavSearch({ sidebar }: { sidebar: SidebarItemsType[] }) {
    const navigate = useNavigate();
    const sidebarData: MenuItemType[] = nestMenuData(sidebar);
    const [open, setOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [searchValue, setSearchValue] = useState("");
    const commandListRef = useRef<HTMLDivElement>(null);
    const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

    // Flatten all items recursively to only include leaf nodes (actual links)
    const flattenMenu = (items: MenuItemType[], parentPath: string, groupLabel: string): FlattenedItem[] => {
        return items.flatMap(item => {
            const currentPath = `${parentPath}/${item.mm_name.toLowerCase()}`.replace(/\/+/g, "/");
            if (item.children && item.children.length > 0) {
                // If it has children, it's a parent/container, don't include as a link
                return flattenMenu(item.children, currentPath, groupLabel);
            }
            // Leaf node - include as clickable link
            return [{
                group: groupLabel,
                label: item.mm_label,
                path: currentPath,
                value: `${groupLabel} ${item.mm_label}`.toLowerCase()
            }];
        });
    };

    const allItems: FlattenedItem[] = sidebarData.flatMap((group) => {
        const groupPath = `${APP_SIDEBAR_PARENT_LINK}/${group.mm_name}`.replace(/\/+/g, "/");
        if (group.children && group.children.length > 0) {
            return flattenMenu(group.children, groupPath, group.mm_label);
        }
        return [{
            group: group.mm_label,
            label: group.mm_label,
            path: groupPath,
            value: group.mm_label.toLowerCase()
        }];
    }) || [];

    // Filter items based on search
    const filteredItems = searchValue
        ? allItems.filter(item =>
            item.value.includes(searchValue.toLowerCase()))
        : allItems;

    // Initialize refs array
    useEffect(() => {
        itemsRef.current = itemsRef.current.slice(0, filteredItems.length);
    }, [filteredItems]);

    // Keyboard shortcuts to open/close
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === NAV_SEARCH_KEYBOARD_KEY && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    // Reset selected index when search changes
    useEffect(() => {
        setSelectedIndex(0);
    }, [searchValue, filteredItems]);

    // Focus the selected item when index changes
    useEffect(() => {
        itemsRef.current[selectedIndex]?.focus();
    }, [selectedIndex]);

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex((prev) =>
                prev < filteredItems.length - 1 ? prev + 1 : 0
            );
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex((prev) =>
                prev > 0 ? prev - 1 : filteredItems.length - 1
            );
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (filteredItems[selectedIndex]) {
                setOpen(false);
                navigate(filteredItems[selectedIndex].path);
            }
        }
    };

    // Group items by their parent
    const groupedItems = filteredItems.reduce((acc, item) => {
        if (!acc[item.group]) {
            acc[item.group] = [];
        }
        acc[item.group].push(item);
        return acc;
    }, {} as Record<string, FlattenedItem[]>);

    return (
        <>
            <Button
                variant="outline"
                className="w-full justify-between bg-background/60 mt-4"
                onClick={() => setOpen(true)}
            >
                <span className="text-muted-foreground text-sm">Search Menu</span>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    <span className="text-xs">⌘</span>
                    {NAV_SEARCH_KEYBOARD_KEY.toUpperCase()}
                </kbd>
            </Button>

            <CommandDialog open={open} onOpenChange={setOpen}>
                <div className="min-h-[80vh]">
                    <div className="flex justify-center items-center text-center p-4">
                        <NavLogo />
                    </div>

                    <CommandInput
                        placeholder="Search menu items..."
                        value={searchValue}
                        onValueChange={setSearchValue}
                        className="min-w-sm"
                    />

                    <CommandList
                        ref={commandListRef}
                        onKeyDown={handleKeyDown}
                        className="min-h-[70vh]"
                    >
                        <CommandEmpty>No results found</CommandEmpty>

                        {Object.entries(groupedItems).map(([groupName, items]) => (
                            <CommandGroup key={groupName} heading={groupName}>
                                {items.map((item) => {
                                    const absoluteIndex = filteredItems.findIndex(
                                        (i) => i.path === item.path
                                    );

                                    return (
                                        <CommandItem
                                            key={item.path}
                                            value={item.value}
                                            ref={(el) => {
                                                itemsRef.current[absoluteIndex] = el;
                                            }}
                                            onSelect={() => {
                                                setOpen(false);
                                                navigate(item.path);
                                            }}
                                        >
                                            {item.label}
                                        </CommandItem>
                                    );
                                })}

                                <hr />
                            </CommandGroup>
                        ))}
                    </CommandList>
                </div>
            </CommandDialog>
        </>
    );
}