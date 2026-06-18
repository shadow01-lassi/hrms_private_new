export interface HelpSample {
    title: string;
    content: string; // HTML string
}

export interface HelpContent {
    pageId: string;
    title: string;
    description: string;
    samples: HelpSample[];
    faqs: { question: string; answer: string }[];
}

export const HELP_DATA: Record<string, HelpContent> = {
    "1": {
        pageId: "1",
        title: "Dashboard Overview",
        description: "Get a high-level view of your society's activities, pending requests, and financial status.",
        samples: [
            {
                title: "Understanding the Widgets",
                content: `<p>The dashboard contains several widgets:</p>
                <ul class="list-disc pl-5 space-y-2 mt-2">
                    <li><strong>Pending Requests:</strong> Shows tasks requiring your immediate attention.</li>
                    <li><strong>Financial Summary:</strong> Displays current month's collection vs expenses.</li>
                    <li><strong>Recent Activity:</strong> A log of actions performed by staff and admins.</li>
                </ul>`
            },
            {
                title: "Quick Actions",
                content: `<p>Use the floating action button or the top bar to quickly jump to common tasks like <em>Add Member</em> or <em>Raise Invoice</em>.</p>`
            }
        ],
        faqs: [
            { question: "How often is the data updated?", answer: "The dashboard data is updated in real-time as transactions and requests are processed." },
            { question: "Can I customize the widgets?", answer: "Currently, widget positions are fixed, but you can filter the data shown in each widget." }
        ]
    },
    "28": {
        pageId: "28",
        title: "Member Register",
        description: "Manage all society members, their flat details, and contact information.",
        samples: [
            {
                title: "Adding a New Member",
                content: `<p>To add a new member, follow these steps:</p>
                <ol class="list-decimal pl-5 space-y-2 mt-2">
                    <li>Click the <strong>Add Member</strong> button at the top right.</li>
                    <li>Fill in the <strong>Primary Owner</strong> details (Name, Mobile, Email).</li>
                    <li>Enter the <strong>Flat Number</strong> and area details.</li>
                    <li>Click <strong>Save</strong> to create the record.</li>
                </ol>`
            },
            {
                title: "Exporting Member List",
                content: `<p>You can export the entire register to Excel by clicking the <strong>Export</strong> button. The exported file will include all contact details and ownership history.</p>`
            }
        ],
        faqs: [
            { question: "How do I update an old owner?", answer: "Go to the member's profile and use the 'Transfer Ownership' feature to archive the current owner and add a new one." }
        ]
    },
    "32": {
        pageId: "32",
        title: "Account Master",
        description: "Configure your chart of accounts and manage financial ledgers.",
        samples: [
            {
                title: "Creating a General Ledger Account",
                content: `<p>Financial accounts are grouped for better reporting:</p>
                <ul class="list-disc pl-5 space-y-2 mt-2">
                    <li>Select the appropriate <strong>Group</strong> (e.g., Assets, Liabilities).</li>
                    <li>Provide a unique <strong>Account Name</strong>.</li>
                    <li>Enable <strong>Status</strong> to make it active for transactions.</li>
                </ul>`
            }
        ],
        faqs: [
            { question: "Can I delete an account?", answer: "Accounts with existing transactions cannot be deleted. You can only mark them as inactive." }
        ]
    }
};

export const DEFAULT_HELP: HelpContent = {
    pageId: "0",
    title: "General Help",
    description: "Welcome to the Conversational AI support center. How can we assist you today?",
    samples: [
        {
            title: "Getting Started",
            content: `<p>Conversational AI is a comprehensive society management platform. Use the sidebar to navigate between different modules like <strong>Billing</strong>, <strong>Accounting</strong>, and <strong>Meetings</strong>.</p>`
        }
    ],
    faqs: [
        { question: "Where do I find more detailed documentation?", answer: "You can visit our main support portal at support.valueye.in for detailed video tutorials." }
    ]
};
