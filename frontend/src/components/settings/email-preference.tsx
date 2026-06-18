// importing client
import api from "@/lib/api";

// importing from react
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// importing shadcn components
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type NotificationSettings = {
    un_email_enabled: boolean
    un_email_project_updates: boolean
    un_email_task_assignments: boolean
    un_email_deadline_reminders: boolean
    un_email_team_mentions: boolean
    un_email_weekly_digest: boolean
    un_email_security_alerts: boolean
}

const notificationOptions: {
    key: keyof NotificationSettings
    label: string
    description: string
}[] = [
        {
            key: "un_email_project_updates",
            label: "Creative Effects",
            description: "Lenses, Filters, Stickers and other creative effects."
        },
        {
            key: "un_email_task_assignments",
            label: "Product Updates",
            description: "New features available on Snapchat!"
        },
        {
            key: "un_email_deadline_reminders",
            label: "Discover Updates",
            description: "Shows, Publishers and other popular content for you."
        },
        {
            key: "un_email_team_mentions",
            label: "Research Surveys",
            description: "User feedback about Snap Inc. products."
        },
        {
            key: "un_email_weekly_digest",
            label: "Lens Studio",
            description: "Lens Studio-related announcements and updates."
        },
        {
            key: "un_email_security_alerts",
            label: "Snap Developer Platform Updates",
            description:
                "New features and updates in Snap Kit SDKs & Developer Portal, Snap Minis and Games."
        },
        {
            key: "un_email_security_alerts", // ⚠️ duplicate in your config
            label: "Friending",
            description: "Friending, follower, and invite alerts."
        }
    ]

export default function SubscriptionPreferencesPage() {
    const [settings, setSettings] = useState<NotificationSettings | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const param = useParams()

    useEffect(() => {
        const id = atob(String(param.token))
        const fetchSettings = async () => {
            try {
                const result = await api.get("/subscription/get-checked", {
                    params: { user_id: id }
                })
                setSettings(result.data.data)
            } catch (error) {
                console.error("Failed to fetch settings", error)
                toast.error("Something went wrong!")
            } finally {
                setLoading(false)
            }
        }
        fetchSettings()
    }, [])

    const toggleSetting = (key: keyof NotificationSettings, value: boolean) => {
        if (!settings) return
        setSettings({ ...settings, [key]: value })
    }

    const handleSave = async () => {
        if (!settings) return
        setSaving(true)
        try {
            await api.put(
                "/subscription/update",
                { notifications: settings },
                { params: { user_id: atob(String(param.token)) } }
            )
            toast.success("Preferences Updated!")
        } catch (error) {
            console.error("Failed to save settings", error)
            toast.error("Failed to save settings")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <div className="text-center py-6">Loading preferences...</div>
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="w-full max-w-lg bg-white rounded-lg border shadow-sm p-6">
                {/* Logo */}
                <div className="flex justify-center mb-3">
                    <img src="/snapchat-logo.svg" alt="Logo" className="w-10 h-10" />
                </div>

                {/* Header */}
                <div className="text-center mb-5">
                    <h1 className="text-xl font-semibold text-gray-900">
                        Subscription Preferences
                    </h1>
                    <p className="text-gray-600 text-xs leading-relaxed mt-1">
                        Choose categories for email updates.
                        You’ll still receive essential messages like password resets.
                    </p>
                </div>

                {/* Preferences */}
                <div className="divide-y border rounded-md bg-gray-50/40">
                    {notificationOptions.map(({ key, label, description }, index) => (
                        <div
                            key={key + index}
                            className="flex items-start space-x-3 px-4 py-3 hover:bg-gray-50"
                        >
                            <Checkbox
                                checked={settings?.[key] ?? false}
                                onCheckedChange={(checked) =>
                                    toggleSetting(key, checked as boolean)
                                }
                                className="mt-0.5"
                            />
                            <div>
                                <h3 className="text-sm font-medium text-gray-900">{label}</h3>
                                <p className="text-xs text-gray-600">{description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Save Button */}
                <div className="mt-6 flex justify-center">
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md"
                    >
                        {saving ? "Saving..." : "Save"}
                    </Button>
                </div>
            </div>
        </div>
    )
}
