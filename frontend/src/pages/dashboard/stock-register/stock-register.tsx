// src/app/stock-register/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search, Trash2, Pen } from "lucide-react";
import { toast } from "sonner";
import { StockForm } from "./stock-register-form";
import { Badge } from "@/components/ui/badge";
// import {
//     AlertDialog,
//     AlertDialogAction,
//     AlertDialogCancel,
//     AlertDialogContent,
//     AlertDialogDescription,
//     AlertDialogFooter,
//     AlertDialogHeader,
//     AlertDialogTitle,
//     AlertDialogTrigger,
// } from "@/components/ui/alert-dialog";

type StockItem = {
    stockId?: number;
    stockType: string;
    stockSubType: string;
    stockSize: string;
    stockQty: number;
    stockRemark1: string;
    stockRemark2: string;
};

export default function StockRegister() {
    const [stockItems, setStockItems] = useState<StockItem[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    // Load mock data (replace with API call in production)
    useEffect(() => {
        const mockData: StockItem[] = [
            {
                stockId: 1,
                stockType: "Gym Equipment",
                stockSubType: "Dumbbells",
                stockSize: "10kg",
                stockQty: 8,
                stockRemark1: "Rubber coated",
                stockRemark2: "Purchased in 2023"
            },
            {
                stockId: 2,
                stockType: "Furniture",
                stockSubType: "Chair",
                stockSize: "Standard",
                stockQty: 25,
                stockRemark1: "Conference room",
                stockRemark2: "Needs replacement soon"
            }
        ];
        setStockItems(mockData);
    }, []);

    const handleAddItem = (newItem: StockItem) => {
        const newId = Math.max(0, ...stockItems.map(item => item.stockId).filter((id): id is number => id !== undefined)) + 1;
        setStockItems([...stockItems, { ...newItem, stockId: newId }]);
        toast.success("New stock item added");
    };

    const handleUpdateItem = (updatedItem: StockItem) => {
        setStockItems(stockItems.map(item =>
            item.stockId === updatedItem.stockId ? updatedItem : item
        ));
        toast.success("Stock item updated");
    };

    const handleDeleteItem = (id: number) => {
        setStockItems(stockItems.filter(item => item.stockId !== id));
        toast.success("Stock item deleted");
    };

    const filteredItems = stockItems.filter(item =>
        Object.values(item).some(
            value => typeof value === "string" &&
                value.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return (
        <div className="container mx-auto py-8 space-y-6">
            <div className="space-y-2">
                <h1 className="heading">
                    Society Stock Register
                </h1>
                <p className="para">The stock items in the society that are used on a day to day basis</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex justify-between w-full gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search stock..."
                                    className="pl-9 w-full md:w-[300px]"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <StockForm onSave={handleAddItem} mode="add">
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Item
                                </Button>
                            </StockForm>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <p className="text-muted-foreground">No stock items found</p>
                            {searchTerm && (
                                <Button variant="ghost" onClick={() => setSearchTerm("")} className="mt-2">
                                    Clear search
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="border rounded-lg overflow-hidden">
                            {/* Table Header */}
                            <div className="hidden sm:grid grid-cols-12 gap-4 p-4 bg-secondary font-medium text-sm">
                                <div className="col-span-3">Type</div>
                                <div className="col-span-2">Sub-Type</div>
                                <div className="col-span-1">Size</div>
                                <div className="col-span-1 text-center">Qty</div>
                                <div className="col-span-3">Notes</div>
                                <div className="col-span-2 text-right">Actions</div>
                            </div>

                            {/* Table Rows */}
                            <div className="divide-y">
                                {filteredItems.map((item) => (
                                    <div key={item.stockId} className="flex flex-wrap sm:grid sm:grid-cols-12 gap-4 p-2 items-center hover:bg-secondary/50 transition-colors">
                                        <div className="col-span-3 font-medium">
                                            {item.stockType}
                                        </div>
                                        <div className="col-span-2 text-sm text-muted-foreground">
                                            {item.stockSubType}
                                        </div>
                                        <div className="col-span-1 text-sm">
                                            {item.stockSize || "-"}
                                        </div>
                                        <div className="col-span-1 text-center">
                                            <Badge variant={"secondary"}>
                                                <span className="flex sm:hidden">Qty:</span>
                                                {item.stockQty}
                                            </Badge>
                                        </div>
                                        <div className="col-span-3 text-sm line-clamp-1">
                                            {item.stockRemark1 || item.stockRemark2 || "-"}
                                        </div>
                                        <div className="col-span-2 flex justify-end gap-2">
                                            <StockForm item={item} onSave={handleUpdateItem} mode="edit">
                                                <Button variant="outline" size={"sm"} className="w-8 h-8">
                                                    <Pen className="h-3.5 w-3.5" />
                                                </Button>
                                            </StockForm>
                                            <Button
                                                variant="destructive"
                                                size={"sm"}
                                                className="w-8 h-8"
                                                onClick={() => item.stockId !== undefined && handleDeleteItem(item.stockId)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>

                                            {/* <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="destructive"
                                                        size={"sm"}
                                                        className="w-8 h-8"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. This will permanently delete your account
                                                            and remove your data from our servers.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => item.stockId !== undefined && handleDeleteItem(item.stockId)}
                                                        >Delete Stock</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog> */}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}