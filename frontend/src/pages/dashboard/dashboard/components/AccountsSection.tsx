import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import {
    Receipt,
    IndianRupee,
    TrendingUp,
    Wallet,
    Banknote,
    Landmark,
    AlertCircle,
    Users,
    FileBarChart,
    BookOpen,
    Scale,
    Bell,
    Plus,
    ArrowRight,
} from "lucide-react";
import { APP_SIDEBAR_PARENT_LINK } from "@/lib/constants";
import { AccountsSectionType } from "@/lib/types";

const formatCurrency = (amount: number): string => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount.toLocaleString("en-IN")}`;
};

const incomeChartConfig: ChartConfig = {
    collected: { label: "Collected", color: "hsl(142, 76%, 36%)" },
    balance: { label: "Balance", color: "hsl(0, 84%, 60%)" },
};

const expenseChartConfig: ChartConfig = {
    amount: { label: "Expense", color: "hsl(262, 83%, 58%)" },
};

export default function AccountsSection({ data }: { data: AccountsSectionType }) {
    const navigate = useNavigate();
    const { incomeTracker, expenseTracker, bankAndCash, duesTracker } = data;

    const pieData = [
        { name: "Collected", value: incomeTracker.totalAmountCollected, fill: "hsl(142, 76%, 36%)" },
        { name: "Balance", value: incomeTracker.totalAmountBalance, fill: "hsl(0, 84%, 60%)" },
    ];

    const collectionPercent = Math.round((incomeTracker.totalAmountCollected / incomeTracker.totalAmountGenerated) * 100);

    return (
        <div className="space-y-4">
            {/* Section Header */}
            <div className="flex items-center gap-2">
                <div className="h-8 w-1 rounded-full bg-emerald-500" />
                <h2 className="heading">Accounts</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="small-heading flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-emerald-500" strokeWidth={2.5} />
                            Income Tracker
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {/* Top stats */}
                        <div className="flex justify-around items-center gap-4 flex-wrap">
                            <div className="flex items-center gap-2">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950">
                                    <Receipt className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-lg font-bold leading-none">{incomeTracker.totalBillsGeneratedThisYear.toLocaleString()}</p>
                                    <p className="text-[10px] text-muted-foreground">Bills Generated</p>
                                </div>
                            </div>

                            <Separator orientation="vertical" className="h-10!" />

                            <div>
                                <p className="text-lg font-bold leading-none text-amber-600">{formatCurrency(incomeTracker.totalAmountBalance)}</p>
                                <p className="text-[10px] text-muted-foreground">Yet to Arrive</p>
                            </div>
                        </div>

                        {/* Pie Chart + Quarter Grid side by side */}
                        <div className="space-y-4">
                            {/* Pie Chart */}
                            <div className="flex flex-col items-center justify-center">
                                <ChartContainer config={incomeChartConfig} className="h-[180px] w-[180px]">
                                    <PieChart>
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Pie
                                            data={pieData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={75}
                                            strokeWidth={2}
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ChartContainer>
                                <div className="text-center -mt-2">
                                    <p className="text-2xl font-bold">{collectionPercent}%</p>
                                    <p className="text-xs text-muted-foreground">Collected</p>
                                </div>
                                <div className="flex gap-4 mt-2 text-xs">
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-2.5 w-2.5 rounded-sm bg-green-600" />
                                        <span className="text-muted-foreground">Collected: {formatCurrency(incomeTracker.totalAmountCollected)}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-2.5 w-2.5 rounded-sm bg-red-500" />
                                        <span className="text-muted-foreground">Balance: {formatCurrency(incomeTracker.totalAmountBalance)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Quarter-wise breakdown */}
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">Quarter-wise Breakdown</p>
                                <div className="space-y-2">
                                    {incomeTracker.quarterlyData.map((q, i) => (
                                        <div key={i} className="rounded-lg bg-muted/50 px-3 py-2 space-y-1">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-medium">{q.quarter}</span>
                                                <span className="text-[10px] text-muted-foreground">{q.billsCreated} bills</span>
                                            </div>
                                            <div className="flex justify-between text-[11px]">
                                                <span className="text-muted-foreground">Generated: {formatCurrency(q.amountGenerated)}</span>
                                                <span className="text-green-600 font-medium">Collected: {formatCurrency(q.amountCollected)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Bottom buttons */}
                        <div className="flex gap-2 pt-1">
                            <Button size="sm" variant="outline" className="flex-1 text-xs"
                                onClick={() => navigate("/dashboard/billing/send-reminders")}>
                                <Bell className="h-3.5 w-3.5 mr-1" /> Send Reminders
                            </Button>
                            <Button size="sm" className="flex-1 text-xs"
                                onClick={() => navigate("/dashboard/billing/create-bills")}>
                                <Plus className="h-3.5 w-3.5 mr-1" /> Create Bills
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    {/* Expense Tracker */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="small-heading flex items-center gap-2">
                                <Wallet className="h-4 w-4 text-purple-500" strokeWidth={2.5} />
                                Expense Tracker
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {/* Bar Chart */}
                            <ChartContainer config={expenseChartConfig} className="h-[160px] w-full">
                                <BarChart data={expenseTracker.quarterlyExpenses} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="quarter" tick={{ fontSize: 10 }} tickLine={false} axisLine={false}
                                        tickFormatter={(val) => val.split(" ")[0]} />
                                    <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false}
                                        tickFormatter={(val) => `${(val / 1000).toFixed(0)}K`} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="amount" fill="var(--color-amount)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ChartContainer>

                            {/* Quarter grid */}
                            <div className="grid grid-cols-4 gap-1">
                                {expenseTracker.quarterlyExpenses.map((q, i) => (
                                    <div key={i} className="text-center rounded-md bg-muted/50 px-1 py-1.5">
                                        <p className="text-[10px] text-muted-foreground">{q.quarter.split(" ")[0]}</p>
                                        <p className="text-xs font-semibold">{formatCurrency(q.amount)}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="text-center space-y-2">
                                <Link
                                    to={`${APP_SIDEBAR_PARENT_LINK}/billings/society-expenses`}
                                    className="h-16 flex items-center justify-center gap-3 p-2 rounded-2xl relative overflow-hidden cursor-pointer shadow-[0_8px_24px_rgba(0,122,255,0.25)] transition-all border border-primary"
                                    style={{ background: "linear-gradient(135deg, var(--primary) 0%, #005ce6 100%)" }}
                                >
                                    <div className="flex items-center gap-2 text-background dark:text-foreground">
                                        <FileBarChart className="h-6 w-6" />
                                        <span className="text-lg font-medium">Track Expenses</span>
                                    </div>
                                    {/* Decorative Circle */}
                                    <div className="absolute -right-5 -top-5 w-16 h-16 rounded-full bg-linear-to-b from-background/25 to-transparent" />
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    {/* General Ledger */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="small-heading flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-indigo-500" strokeWidth={2.5} />
                                General Ledger
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                                <Button variant="outline" className="gap-2"
                                    onClick={() => navigate("/dashboard/accounts/trial-balance")}>
                                    <Scale className="h-4 w-4 text-indigo-500" />
                                    Trial Balance
                                </Button>
                                <Button variant="outline" className="gap-2"
                                    onClick={() => navigate("/dashboard/accounts/profit-loss")}>
                                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                                    Profit & Loss
                                </Button>
                            </div>
                            <Button variant="outline" className="w-full gap-2"
                                onClick={() => navigate("/dashboard/accounts/balance-sheet")}>
                                <FileBarChart className="h-4 w-4 text-blue-500" />
                                Balance Sheet
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-4">
                    {/* Bank & Cash */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="small-heading flex items-center gap-2">
                                <Banknote className="h-4 w-4 text-teal-500" strokeWidth={2.5} />
                                Bank & Cash
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="text-center rounded-lg bg-linear-to-r from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/30 p-3 border border-teal-100 dark:border-teal-900">
                                <p className="text-[11px] text-muted-foreground">Total Balance</p>
                                <p className="text-2xl font-bold text-teal-700 dark:text-teal-400">{formatCurrency(bankAndCash.totalAmount)}</p>
                            </div>
                            <div className="space-y-1.5">
                                {bankAndCash.accounts.map((acc, i) => (
                                    <div key={i} className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                                        {acc.type === "bank" ? (
                                            <Landmark className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                                        ) : (
                                            <IndianRupee className="h-3.5 w-3.5 text-green-500 shrink-0" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium truncate">{acc.name}</p>
                                            {acc.accountNumber && (
                                                <p className="text-[10px] text-muted-foreground">{acc.accountNumber}</p>
                                            )}
                                        </div>
                                        <span className="text-xs font-semibold shrink-0">{formatCurrency(acc.balance)}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Dues Tracker */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="small-heading flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-red-500" strokeWidth={2.5} />
                                Dues Tracker
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 p-3 text-center">
                                    <Users className="h-5 w-5 mx-auto text-red-500 mb-1" />
                                    <p className="text-xl font-bold text-red-700 dark:text-red-400">{duesTracker.totalDefaulters}</p>
                                    <p className="text-[10px] text-red-600 dark:text-red-400">Defaulter Members</p>
                                </div>
                                <div className="rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 p-3 text-center">
                                    <IndianRupee className="h-5 w-5 mx-auto text-amber-500 mb-1" />
                                    <p className="text-xl font-bold text-amber-700 dark:text-amber-400">{formatCurrency(duesTracker.totalAmountDue)}</p>
                                    <p className="text-[10px] text-amber-600 dark:text-amber-400">Amount Due</p>
                                </div>
                            </div>
                            <Button size="sm" variant="outline" className="w-full text-xs"
                                onClick={() => navigate("/dashboard/billing/defaulters")}>
                                <ArrowRight className="h-3.5 w-3.5 mr-1" /> View Full Defaulter List
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
