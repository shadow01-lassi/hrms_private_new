// src/components/stock-form.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HelpCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useState } from 'react';

type StockItem = {
    stockId?: number;
    stockType: string;
    stockSubType: string;
    stockSize: string;
    stockQty: number;
    stockRemark1: string;
    stockRemark2: string;
};

export function StockForm({
    item,
    onSave,
    children,
    mode = 'add'
}: {
    item?: StockItem;
    onSave: (item: StockItem) => void;
    children: React.ReactNode;
    mode?: 'add' | 'edit';
}) {
    const [open, setOpen] = useState<boolean>(false);
    const [formData, setFormData] = useState<StockItem>(item || {
        stockType: '',
        stockSubType: '',
        stockSize: '',
        stockQty: 0,
        stockRemark1: '',
        stockRemark2: ''
    });

    const handleChange = (field: keyof StockItem, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        setOpen(false);
        setFormData({
            stockType: '',
            stockSubType: '',
            stockSize: '',
            stockQty: 0,
            stockRemark1: '',
            stockRemark2: ''
        });
    };

    const FieldDescription = ({ text }: { text: string }) => (
        <Popover>
            <PopoverTrigger>
                <HelpCircle className="h-4 w-4 ml-2 text-muted-foreground hover:text-primary" />
            </PopoverTrigger>
            <PopoverContent className="w-80 text-sm">
                {text}
            </PopoverContent>
        </Popover>
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{mode === 'add' ? 'Add New Stock Item' : 'Edit Stock Item'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center">
                                <Label htmlFor="stockType">Stock Type</Label>
                                <FieldDescription text="Main category of the item (e.g., Gym Equipment, Furniture)" />
                            </div>
                            <Input
                                id="stockType"
                                value={formData.stockType}
                                onChange={(e) => handleChange('stockType', e.target.value)}
                                placeholder="e.g., Gym Equipment"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center">
                                <Label htmlFor="stockSubType">Stock Sub-Type</Label>
                                <FieldDescription text="Specific type within the category (e.g., Treadmill, Chair)" />
                            </div>
                            <Input
                                id="stockSubType"
                                value={formData.stockSubType}
                                onChange={(e) => handleChange('stockSubType', e.target.value)}
                                placeholder="e.g., Dumbbells"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center">
                                <Label htmlFor="stockSize">Stock Size</Label>
                                <FieldDescription text="Size description (e.g., Large, Small, 10kg)" />
                            </div>
                            <Input
                                id="stockSize"
                                value={formData.stockSize}
                                onChange={(e) => handleChange('stockSize', e.target.value)}
                                placeholder="e.g., Large"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center">
                                <Label htmlFor="stockQty">Quantity</Label>
                                <FieldDescription text="Number of items available (must be 0 or more)" />
                            </div>
                            <Input
                                id="stockQty"
                                type="number"
                                value={formData.stockQty}
                                onChange={(e) => handleChange('stockQty', parseInt(e.target.value) || 0)}
                                min="0"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center">
                            <Label htmlFor="stockRemark1">Remark 1</Label>
                            <FieldDescription text="Additional notes about this item (optional)" />
                        </div>
                        <Textarea
                            id="stockRemark1"
                            value={formData.stockRemark1}
                            onChange={(e) => handleChange('stockRemark1', e.target.value)}
                            placeholder="Any special notes about this item"
                            rows={2}
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center">
                            <Label htmlFor="stockRemark2">Remark 2</Label>
                            <FieldDescription text="Additional notes about this item (optional)" />
                        </div>
                        <Textarea
                            id="stockRemark2"
                            value={formData.stockRemark2}
                            onChange={(e) => handleChange('stockRemark2', e.target.value)}
                            placeholder="Any other details about this item"
                            rows={2}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <DialogTrigger asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                        </DialogTrigger>
                        <Button type="submit">Save Item</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}