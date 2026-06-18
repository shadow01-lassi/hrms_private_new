import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
    Bell,
    Palette,
    User,
    Shield,
    Mail,
    Monitor,
    Moon,
    Sun,
    Settings2,
    Save,
    RotateCcw,
    Clock,
    Volume2,
    VolumeX,
    Loader2
} from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { toast } from "sonner";
import { getFromStorage, putIntoStorage } from "@/lib/storage";
import api from "@/lib/api";

// Updated Types based on your new database structure
export interface SettingsData {
    // Core settings
    us_theme: 'light' | 'dark' | 'system';
    us_accent_color: string;
    us_screen_width: 'L' | 'M' | 'S';
    us_links_view: 'N' | 'S';
    us_timeout_duration: string;

    // Notification settings (updated with un_ prefix)
    un_email_enabled: boolean;
    un_in_app_enabled: boolean;
    un_email_project_updates: boolean;
    un_email_task_assignments: boolean;
    un_email_deadline_reminders: boolean;
    un_email_team_mentions: boolean;
    un_email_weekly_digest: boolean;
    un_email_security_alerts: boolean;
    un_in_app_new_tasks: boolean;
    un_in_app_comments: boolean;
    un_in_app_approvals: boolean;
    un_in_app_calendar_events: boolean;
    un_in_app_achievement_unlocks: boolean;
    un_in_app_suggestion_tips: boolean;
    un_do_not_disturb_enabled: boolean;
    un_do_not_disturb_start_time: string;
    un_do_not_disturb_end_time: string;
    un_quiet_hours_enabled: boolean;
    un_quiet_hours_days: string[];
    un_quiet_hours_start_time: string;
    un_quiet_hours_end_time: string;

    // Profile
    ul_name: string;
    ul_email: string;
    ul_mobile: string;

    // Security
    two_factor_auth: boolean;
    login_alerts: boolean;
    session_timeout: number;
    password_last_changed: string;

    // Preferences
    language: string;
    timezone: string;
    date_format: string;
    time_format: string;
    week_start: string;

    // Privacy
    analytics: boolean;
    personalizedAds: boolean;
    improvementProgram: boolean;
    profile: string;
    activity: string;
    email: string;
    autoDelete: boolean;
    deleteAfterMonths: number;

}

// Default settings based on your new database defaults
const defaultSettings: SettingsData = {
    // Core settings
    us_theme: 'system',
    us_accent_color: '#3b82f6',
    us_screen_width: 'M',
    us_links_view: 'S',
    us_timeout_duration: "120m",

    // Notification settings (updated with un_ prefix and new defaults)
    un_email_enabled: true,
    un_in_app_enabled: true,
    un_email_project_updates: true,
    un_email_task_assignments: true,
    un_email_deadline_reminders: true,
    un_email_team_mentions: true,
    un_email_weekly_digest: false,
    un_email_security_alerts: true,
    un_in_app_new_tasks: true,
    un_in_app_comments: true,
    un_in_app_approvals: true,
    un_in_app_calendar_events: true,
    un_in_app_achievement_unlocks: false,
    un_in_app_suggestion_tips: true,
    un_do_not_disturb_enabled: false,
    un_do_not_disturb_start_time: "22:00",
    un_do_not_disturb_end_time: "08:00",
    un_quiet_hours_enabled: true,
    un_quiet_hours_days: ["saturday", "sunday"],
    un_quiet_hours_start_time: "20:00",
    un_quiet_hours_end_time: "10:00",

    // Profile
    ul_name: "John Doe",
    ul_email: "john.doe@company.com",
    ul_mobile: "+1 (555) 123-4567",

    // Security
    two_factor_auth: true,
    login_alerts: true,
    session_timeout: 60,
    password_last_changed: "2024-01-15",

    // Preferences
    language: "en",
    timezone: "America/New_York",
    date_format: "MM/DD/YYYY",
    time_format: "12h",
    week_start: "monday",

    // Privacy
    analytics: true,
    personalizedAds: false,
    improvementProgram: true,
    profile: "team",
    activity: "team",
    email: "team",
    autoDelete: false,
    deleteAfterMonths: 36
};

export function OtherSettings() {
    const [settings, setSettings] = useState<SettingsData>(defaultSettings);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const accentColors = [
        "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6",
        "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1"
    ];

    const [originalUserDetails, setOriginalUserDetails] = useState({
        ul_name: "",
        ul_email: "",
        ul_mobile: ""
    });

    // Fetch settings on component mount
    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setIsLoading(true);


            const temp = getFromStorage("notificationAccess");
            const backendData = JSON.parse(temp as string)
            setOriginalUserDetails({
                ul_name: backendData.ul_name || defaultSettings.ul_name,
                ul_email: backendData.ul_email || defaultSettings.ul_email,
                ul_mobile: backendData.ul_mobile || defaultSettings.ul_mobile
            });

            // Manual mapping with null checks for new notification fields
            const mergedSettings: SettingsData = {
                // Core settings
                us_theme: backendData.us_theme || defaultSettings.us_theme,
                us_accent_color: backendData.us_accent_color || defaultSettings.us_accent_color,
                us_screen_width: backendData.us_screen_width || defaultSettings.us_screen_width,
                us_links_view: backendData.us_links_view || defaultSettings.us_links_view,
                us_timeout_duration: backendData.us_timeout_duration || defaultSettings.us_timeout_duration,

                // Notification settings (updated with un_ prefix)
                un_email_enabled: backendData.un_email_enabled !== null ? backendData.un_email_enabled : defaultSettings.un_email_enabled,
                un_in_app_enabled: backendData.un_in_app_enabled !== null ? backendData.un_in_app_enabled : defaultSettings.un_in_app_enabled,
                un_email_project_updates: backendData.un_email_project_updates !== null ? backendData.un_email_project_updates : defaultSettings.un_email_project_updates,
                un_email_task_assignments: backendData.un_email_task_assignments !== null ? backendData.un_email_task_assignments : defaultSettings.un_email_task_assignments,
                un_email_deadline_reminders: backendData.un_email_deadline_reminders !== null ? backendData.un_email_deadline_reminders : defaultSettings.un_email_deadline_reminders,
                un_email_team_mentions: backendData.un_email_team_mentions !== null ? backendData.un_email_team_mentions : defaultSettings.un_email_team_mentions,
                un_email_weekly_digest: backendData.un_email_weekly_digest !== null ? backendData.un_email_weekly_digest : defaultSettings.un_email_weekly_digest,
                un_email_security_alerts: backendData.un_email_security_alerts !== null ? backendData.un_email_security_alerts : defaultSettings.un_email_security_alerts,
                un_in_app_new_tasks: backendData.un_in_app_new_tasks !== null ? backendData.un_in_app_new_tasks : defaultSettings.un_in_app_new_tasks,
                un_in_app_comments: backendData.un_in_app_comments !== null ? backendData.un_in_app_comments : defaultSettings.un_in_app_comments,
                un_in_app_approvals: backendData.un_in_app_approvals !== null ? backendData.un_in_app_approvals : defaultSettings.un_in_app_approvals,
                un_in_app_calendar_events: backendData.un_in_app_calendar_events !== null ? backendData.un_in_app_calendar_events : defaultSettings.un_in_app_calendar_events,
                un_in_app_achievement_unlocks: backendData.un_in_app_achievement_unlocks !== null ? backendData.un_in_app_achievement_unlocks : defaultSettings.un_in_app_achievement_unlocks,
                un_in_app_suggestion_tips: backendData.un_in_app_suggestion_tips !== null ? backendData.un_in_app_suggestion_tips : defaultSettings.un_in_app_suggestion_tips,
                un_do_not_disturb_enabled: backendData.un_do_not_disturb_enabled !== null ? backendData.un_do_not_disturb_enabled : defaultSettings.un_do_not_disturb_enabled,
                un_do_not_disturb_start_time: backendData.un_do_not_disturb_start_time || defaultSettings.un_do_not_disturb_start_time,
                un_do_not_disturb_end_time: backendData.un_do_not_disturb_end_time || defaultSettings.un_do_not_disturb_end_time,
                un_quiet_hours_enabled: backendData.un_quiet_hours_enabled !== null ? backendData.un_quiet_hours_enabled : defaultSettings.un_quiet_hours_enabled,
                un_quiet_hours_days: backendData.un_quiet_hours_days || defaultSettings.un_quiet_hours_days,
                un_quiet_hours_start_time: backendData.un_quiet_hours_start_time || defaultSettings.un_quiet_hours_start_time,
                un_quiet_hours_end_time: backendData.un_quiet_hours_end_time || defaultSettings.un_quiet_hours_end_time,

                // Profile
                ul_name: backendData.ul_name || defaultSettings.ul_name,
                ul_email: backendData.ul_email || defaultSettings.ul_email,
                ul_mobile: backendData.ul_mobile || defaultSettings.ul_mobile,

                // Security
                two_factor_auth: backendData.two_factor_auth !== null ? backendData.two_factor_auth : defaultSettings.two_factor_auth,
                login_alerts: backendData.login_alerts !== null ? backendData.login_alerts : defaultSettings.login_alerts,
                session_timeout: backendData.session_timeout || defaultSettings.session_timeout,
                password_last_changed: backendData.password_last_changed || defaultSettings.password_last_changed,

                // Preferences
                language: backendData.language || defaultSettings.language,
                timezone: backendData.timezone || defaultSettings.timezone,
                date_format: backendData.date_format || defaultSettings.date_format,
                time_format: backendData.time_format || defaultSettings.time_format,
                week_start: backendData.week_start || defaultSettings.week_start,

                // Privacy
                analytics: backendData.analytics !== null ? backendData.analytics : defaultSettings.analytics,
                personalizedAds: backendData.personalizedAds !== null ? backendData.personalizedAds : defaultSettings.personalizedAds,
                improvementProgram: backendData.improvementProgram !== null ? backendData.improvementProgram : defaultSettings.improvementProgram,
                profile: backendData.profile || defaultSettings.profile,
                activity: backendData.activity || defaultSettings.activity,
                email: backendData.email || defaultSettings.email,
                autoDelete: backendData.autoDelete !== null ? backendData.autoDelete : defaultSettings.autoDelete,
                deleteAfterMonths: backendData.deleteAfterMonths || defaultSettings.deleteAfterMonths
            };

            console.log('Merged Settings:', mergedSettings);
            setSettings(mergedSettings);
        } catch (error) {
            console.error('Error fetching settings:', error);
            toast.error("Error loading settings");
            setSettings(defaultSettings);
        } finally {
            setIsLoading(false);
        }
    };

    const updateSettings = (updates: Partial<SettingsData>) => {
        setSettings(prev => ({
            ...prev,
            ...updates
        }));
    };

    const updateNotificationSetting = (key: keyof SettingsData, value: any) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const resetToDefaults = () => {
        // Reset all settings to default values but preserve user details
        setSettings(() => ({
            ...defaultSettings,
            // Preserve user details from original data
            ul_name: originalUserDetails.ul_name,
            ul_email: originalUserDetails.ul_email,
            ul_mobile: originalUserDetails.ul_mobile
        }));
        toast.success("Settings reset to defaults");
    };

    const saveSettings = async () => {
        try {
            setIsSaving(true);

            // Structured data for different sections
            const structuredData = {
                user_setting: {
                    us_theme: settings.us_theme,
                    us_accent_color: settings.us_accent_color,
                    us_screen_width: settings.us_screen_width,
                    us_links_view: settings.us_links_view,
                    us_timeout_duration: settings.us_timeout_duration
                },
                notifications: {
                    un_email_enabled: settings.un_email_enabled,
                    un_in_app_enabled: settings.un_in_app_enabled,
                    un_email_project_updates: settings.un_email_project_updates,
                    un_email_task_assignments: settings.un_email_task_assignments,
                    un_email_deadline_reminders: settings.un_email_deadline_reminders,
                    un_email_team_mentions: settings.un_email_team_mentions,
                    un_email_weekly_digest: settings.un_email_weekly_digest,
                    un_email_security_alerts: settings.un_email_security_alerts,
                    un_in_app_new_tasks: settings.un_in_app_new_tasks,
                    un_in_app_comments: settings.un_in_app_comments,
                    un_in_app_approvals: settings.un_in_app_approvals,
                    un_in_app_calendar_events: settings.un_in_app_calendar_events,
                    un_in_app_achievement_unlocks: settings.un_in_app_achievement_unlocks,
                    un_in_app_suggestion_tips: settings.un_in_app_suggestion_tips,
                    un_do_not_disturb_enabled: settings.un_do_not_disturb_enabled,
                    un_do_not_disturb_start_time: settings.un_do_not_disturb_start_time,
                    un_do_not_disturb_end_time: settings.un_do_not_disturb_end_time,
                    un_quiet_hours_enabled: settings.un_quiet_hours_enabled,
                    un_quiet_hours_days: settings.un_quiet_hours_days,
                    un_quiet_hours_start_time: settings.un_quiet_hours_start_time,
                    un_quiet_hours_end_time: settings.un_quiet_hours_end_time
                },
                profile: {
                    ul_name: settings.ul_name,
                    ul_email: settings.ul_email,
                    ul_mobile: settings.ul_mobile
                },
                security: {
                    two_factor_auth: settings.two_factor_auth,
                    login_alerts: settings.login_alerts,
                    session_timeout: settings.session_timeout,
                    password_last_changed: settings.password_last_changed
                },
                preferences: {
                    language: settings.language,
                    timezone: settings.timezone,
                    date_format: settings.date_format,
                    time_format: settings.time_format,
                    week_start: settings.week_start
                },
                privacy: {
                    analytics: settings.analytics,
                    personalizedAds: settings.personalizedAds,
                    improvementProgram: settings.improvementProgram,
                    profile: settings.profile,
                    activity: settings.activity,
                    email: settings.email,
                    autoDelete: settings.autoDelete,
                    deleteAfterMonths: settings.deleteAfterMonths
                }
            };

            await api.put("/user-setting", structuredData);

            toast.success("Settings saved successfully");
            putIntoStorage("notificationAccess", JSON.stringify(settings))

        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error("Failed to save settings");
        } finally {
            setIsSaving(false);
        }
    };

    // Helper function to format setting keys for display
    const formatSettingKey = (key: string): string => {
        return key
            .replace(/^un_/, '')
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase())
            .replace(/Email\b/gi, 'Email')
            .replace(/In App\b/gi, 'In-App');
    };

    // Map screen width to display values

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    <p className="text-muted-foreground">Loading settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="sub-heading">
                                Primary Settings
                            </h1>
                            <p className="text-muted-foreground mt-2">Customize your {APP_NAME} experience</p>
                        </div>

                        <div className="flex space-x-3">
                            <Button
                                variant="outline"
                                onClick={resetToDefaults}
                                disabled={isSaving}
                            >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Reset Defaults
                            </Button>

                            <Button
                                onClick={saveSettings}
                                className="blue-button"
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                {isSaving ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </div>
                </div>

                <Tabs defaultValue="notifications" className="space-y-8">
                    <TabsList className="grid w-full grid-cols-4 p-1 rounded-xl">
                        <TabsTrigger value="notifications" className="flex items-center space-x-2 data-[state=active]:bg-white/60! dark:data-[state=active]:bg-white/20! data-[state=active]:shadow-sm">
                            <Bell className="w-4 h-4" />
                            <span>Notifications</span>
                        </TabsTrigger>
                        <TabsTrigger value="appearance" className="flex items-center space-x-2 data-[state=active]:bg-white/60! dark:data-[state=active]:bg-white/20! data-[state=active]:shadow-sm">
                            <Palette className="w-4 h-4" />
                            <span>Appearance</span>
                        </TabsTrigger>
                        <TabsTrigger value="account" className="flex items-center space-x-2 data-[state=active]:bg-white/60! dark:data-[state=active]:bg-white/20! data-[state=active]:shadow-sm">
                            <User className="w-4 h-4" />
                            <span>Account</span>
                        </TabsTrigger>
                        <TabsTrigger value="privacy" className="flex items-center space-x-2 data-[state=active]:bg-white/60! dark:data-[state=active]:bg-white/20! data-[state=active]:shadow-sm">
                            <Shield className="w-4 h-4" />
                            <span>Privacy</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Notifications Tab - UPDATED WITH NEW FIELDS */}
                    <TabsContent value="notifications" className="space-y-6">
                        {/* Email Notifications Card */}
                        <Card className="border-0 shadow-lg bg-background/60">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Mail className="w-5 h-5" />
                                    <span>Email Notifications</span>
                                </CardTitle>
                                <CardDescription>Manage your email notification preferences</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="email-enabled" className="text-base">Email Notifications</Label>
                                        <p className="text-sm text-slate-500">Receive notifications via email</p>
                                    </div>
                                    <Switch
                                        id="email-enabled"
                                        checked={settings.un_email_enabled}
                                        onCheckedChange={(checked) => updateNotificationSetting("un_email_enabled", checked)}
                                    />
                                </div>

                                <Separator />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Object.entries(settings)
                                        .filter(([key, value]) =>
                                            key.startsWith('un_email_') &&
                                            key !== 'un_email_enabled' &&
                                            typeof value === 'boolean'
                                        )
                                        .map(([key, value]) => (
                                            <div key={key} className="flex items-center space-x-3">
                                                <Switch
                                                    checked={value as boolean}
                                                    onCheckedChange={(checked) => updateNotificationSetting(key as keyof SettingsData, checked)}
                                                    disabled={!settings.un_email_enabled}
                                                />
                                                <Label>{formatSettingKey(key)}</Label>
                                            </div>
                                        ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* In-App Notifications Card */}
                        <Card className="border-0 shadow-lg bg-background/60">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Monitor className="w-5 h-5" />
                                    <span>In-App Notifications</span>
                                </CardTitle>
                                <CardDescription>Notifications within the application</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="inapp-enabled" className="text-base">In-App Notifications</Label>
                                        <p className="text-sm text-slate-500">Show notifications within the app</p>
                                    </div>
                                    <Switch
                                        id="inapp-enabled"
                                        checked={settings.un_in_app_enabled}
                                        onCheckedChange={(checked) => updateNotificationSetting("un_in_app_enabled", checked)}
                                    />
                                </div>

                                <Separator />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Object.entries(settings)
                                        .filter(([key, value]) =>
                                            key.startsWith('un_in_app_') &&
                                            key !== 'un_in_app_enabled' &&
                                            typeof value === 'boolean'
                                        )
                                        .map(([key, value]) => (
                                            <div key={key} className="flex items-center space-x-3">
                                                <Switch
                                                    checked={value as boolean}
                                                    onCheckedChange={(checked) => updateNotificationSetting(key as keyof SettingsData, checked)}
                                                    disabled={!settings.un_in_app_enabled}
                                                />
                                                <Label>{formatSettingKey(key)}</Label>
                                            </div>
                                        ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Notification Schedule Card */}
                        <Card className="border-0 shadow-lg bg-background/60">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Clock className="w-5 h-5" />
                                    <span>Notification Schedule</span>
                                </CardTitle>
                                <CardDescription>Control when you receive notifications</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Do Not Disturb */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label className="text-base flex items-center space-x-2">
                                                    <VolumeX className="w-4 h-4" />
                                                    <span>Do Not Disturb</span>
                                                </Label>
                                                <p className="text-sm text-slate-500">Silence notifications during specific hours</p>
                                            </div>
                                            <Switch
                                                checked={settings.un_do_not_disturb_enabled}
                                                onCheckedChange={(checked) => updateNotificationSetting("un_do_not_disturb_enabled", checked)}
                                            />
                                        </div>

                                        {settings.un_do_not_disturb_enabled && (
                                            <div className="flex space-x-4">
                                                <div className="flex-1">
                                                    <Label>Start Time</Label>
                                                    <Input
                                                        type="time"
                                                        value={settings.un_do_not_disturb_start_time}
                                                        onChange={(e) => updateNotificationSetting("un_do_not_disturb_start_time", e.target.value)}
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <Label>End Time</Label>
                                                    <Input
                                                        type="time"
                                                        value={settings.un_do_not_disturb_end_time}
                                                        onChange={(e) => updateNotificationSetting("un_do_not_disturb_end_time", e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Quiet Hours */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label className="text-base flex items-center space-x-2">
                                                    <Volume2 className="w-4 h-4" />
                                                    <span>Quiet Hours</span>
                                                </Label>
                                                <p className="text-sm text-slate-500">Reduce notification frequency on specific days</p>
                                            </div>
                                            <Switch
                                                checked={settings.un_quiet_hours_enabled}
                                                onCheckedChange={(checked) => updateNotificationSetting("un_quiet_hours_enabled", checked)}
                                            />
                                        </div>

                                        {settings.un_quiet_hours_enabled && (
                                            <div className="space-y-3">
                                                <div className="flex space-x-4">
                                                    <div className="flex-1">
                                                        <Label>Start Time</Label>
                                                        <Input
                                                            type="time"
                                                            value={settings.un_quiet_hours_start_time}
                                                            onChange={(e) => updateNotificationSetting("un_quiet_hours_start_time", e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <Label>End Time</Label>
                                                        <Input
                                                            type="time"
                                                            value={settings.un_quiet_hours_end_time}
                                                            onChange={(e) => updateNotificationSetting("un_quiet_hours_end_time", e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label>Days</Label>
                                                    <Select
                                                        value={settings.un_quiet_hours_days.join(',')}
                                                        onValueChange={(value) => updateNotificationSetting("un_quiet_hours_days", value.split(','))}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="saturday,sunday">Weekends</SelectItem>
                                                            <SelectItem value="monday,tuesday,wednesday,thursday,friday">Weekdays</SelectItem>
                                                            <SelectItem value="monday,tuesday,wednesday,thursday,friday,saturday,sunday">Every day</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Appearance Tab */}
                    <TabsContent value="appearance" className="space-y-6">
                        <Card className="border-0 shadow-lg bg-background/60">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Palette className="w-5 h-5" />
                                    <span>Theme & Layout</span>
                                </CardTitle>
                                <CardDescription>Customize the look and feel of your application</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <Label className="text-base">Theme Preference</Label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {[
                                            { value: "light", icon: Sun, label: "Light" },
                                            { value: "dark", icon: Moon, label: "Dark" },
                                            { value: "system", icon: Settings2, label: "System" }
                                        ].map(({ value, icon: Icon, label }) => (
                                            <div
                                                key={value}
                                                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${settings.us_theme === value
                                                    ? "border-blue-500 bg-blue-500/10"
                                                    : "border-muted hover:border-muted-foreground/60"
                                                    }`}
                                                onClick={() => updateSettings({ us_theme: value as 'light' | 'dark' | 'system' })}
                                            >
                                                <Icon className="w-6 h-6 mb-2" />
                                                <div className="font-medium">{label}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-4">
                                    <Label className="text-base">Accent Color</Label>
                                    <p className="text-sm text-slate-500">Choose your preferred accent color</p>
                                    <div className="flex flex-wrap gap-3">
                                        {accentColors.map((color) => (
                                            <div
                                                key={color}
                                                className={`w-10 h-10 rounded-full cursor-pointer border-2 transition-transform ${settings.us_accent_color === color
                                                    ? "border-slate-800 scale-110 ring-2 ring-offset-2 ring-blue-500"
                                                    : "border-slate-200 hover:scale-105"
                                                    }`}
                                                style={{ backgroundColor: color }}
                                                onClick={() => updateSettings({ us_accent_color: color })}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <Separator />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <Label className="text-base">Screen Width</Label>
                                        <Select
                                            value={settings.us_screen_width}
                                            onValueChange={(value: 'L' | 'M' | 'S') => updateSettings({ us_screen_width: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="S">Small</SelectItem>
                                                <SelectItem value="M">Medium</SelectItem>
                                                <SelectItem value="L">Large</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-4">
                                        <Label className="text-base">Links View</Label>
                                        <Select
                                            value={settings.us_links_view}
                                            onValueChange={(value: 'N' | 'S') => updateSettings({ us_links_view: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="S">Sidebar</SelectItem>
                                                <SelectItem value="N">Navbar</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Account Tab */}
                    <TabsContent value="account" className="space-y-6">
                        <Card className="border-0 shadow-lg bg-background/60">
                            <CardHeader>
                                <CardTitle>Profile Information</CardTitle>
                                <CardDescription>Update your personal and professional details</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label>Name</Label>
                                        <Input
                                            value={settings.ul_name}
                                            onChange={(e) => updateSettings({ ul_name: e.target.value })}
                                        />
                                    </div>

                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label>Email</Label>
                                        <Input
                                            type="email"
                                            value={settings.ul_email}
                                            onChange={(e) => updateSettings({ ul_email: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Phone</Label>
                                        <Input
                                            value={settings.ul_mobile}
                                            onChange={(e) => updateSettings({ ul_mobile: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-lg bg-background/60">
                            <CardHeader>
                                <CardTitle>Security Settings</CardTitle>
                                <CardDescription>Manage your account security preferences</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label className="text-base">Two-Factor Authentication</Label>
                                        <p className="text-sm text-slate-500">Add an extra layer of security to your account</p>
                                    </div>
                                    <Switch
                                        checked={settings.two_factor_auth}
                                        onCheckedChange={(checked) => updateSettings({ two_factor_auth: checked })}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label className="text-base">Login Alerts</Label>
                                        <p className="text-sm text-slate-500">Get notified of new sign-ins</p>
                                    </div>
                                    <Switch
                                        checked={settings.login_alerts}
                                        onCheckedChange={(checked) => updateSettings({ login_alerts: checked })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Session Timeout</Label>
                                    <Select
                                        value={settings.us_timeout_duration.toString()}
                                        onValueChange={(value) => updateSettings({ us_timeout_duration: (value) })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="15m">15 minutes</SelectItem>
                                            <SelectItem value="30m">30 minutes</SelectItem>
                                            <SelectItem value="60m">1 hour</SelectItem>
                                            <SelectItem value="120m">2 hours</SelectItem>
                                            <SelectItem value="240m">4 hours</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-lg bg-background/60">
                            <CardHeader>
                                <CardTitle>Preferences</CardTitle>
                                <CardDescription>Customize your application preferences</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Language</Label>
                                        <Select
                                            value={settings.language}
                                            onValueChange={(value) => updateSettings({ language: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="en">English</SelectItem>
                                                <SelectItem value="es">Spanish</SelectItem>
                                                <SelectItem value="fr">French</SelectItem>
                                                <SelectItem value="de">German</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Timezone</Label>
                                        <Select
                                            value={settings.timezone}
                                            onValueChange={(value) => updateSettings({ timezone: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="America/New_York">Eastern Time</SelectItem>
                                                <SelectItem value="America/Chicago">Central Time</SelectItem>
                                                <SelectItem value="America/Denver">Mountain Time</SelectItem>
                                                <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>Date Format</Label>
                                        <Select
                                            value={settings.date_format}
                                            onValueChange={(value) => updateSettings({ date_format: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                                                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                                                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Time Format</Label>
                                        <Select
                                            value={settings.time_format}
                                            onValueChange={(value) => updateSettings({ time_format: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="12h">12-hour</SelectItem>
                                                <SelectItem value="24h">24-hour</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Week Starts On</Label>
                                        <Select
                                            value={settings.week_start}
                                            onValueChange={(value) => updateSettings({ week_start: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="monday">Monday</SelectItem>
                                                <SelectItem value="sunday">Sunday</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Privacy Tab */}
                    <TabsContent value="privacy" className="space-y-6">
                        <Card className="border-0 shadow-lg bg-background/60">
                            <CardHeader>
                                <CardTitle>Data Sharing</CardTitle>
                                <CardDescription>Control how your data is used to improve our services</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label className="text-base">Usage Analytics</Label>
                                        <p className="text-sm text-slate-500">Help us improve by sharing usage data</p>
                                    </div>
                                    <Switch
                                        checked={settings.analytics}
                                        onCheckedChange={(checked) => updateSettings({ analytics: checked })}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label className="text-base">Personalized Ads</Label>
                                        <p className="text-sm text-slate-500">See relevant advertisements</p>
                                    </div>
                                    <Switch
                                        checked={settings.personalizedAds}
                                        onCheckedChange={(checked) => updateSettings({ personalizedAds: checked })}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label className="text-base">Improvement Program</Label>
                                        <p className="text-sm text-slate-500">Participate in product improvement programs</p>
                                    </div>
                                    <Switch
                                        checked={settings.improvementProgram}
                                        onCheckedChange={(checked) => updateSettings({ improvementProgram: checked })}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-lg bg-background/60">
                            <CardHeader>
                                <CardTitle>Visibility Settings</CardTitle>
                                <CardDescription>Control who can see your information</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {(['profile', 'activity', 'email'] as const).map((key) => (
                                    <div key={key} className="flex items-center justify-between">
                                        <div>
                                            <Label className="text-base capitalize">{key}</Label>
                                            <p className="text-sm text-slate-500">Who can see your {key}</p>
                                        </div>
                                        <Select
                                            value={settings[key]}
                                            onValueChange={(value) => updateSettings({ [key]: value })}
                                        >
                                            <SelectTrigger className="w-32">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="public">Public</SelectItem>
                                                <SelectItem value="team">Team</SelectItem>
                                                <SelectItem value="private">Private</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-lg bg-background/60">
                            <CardHeader>
                                <CardTitle>Data Retention</CardTitle>
                                <CardDescription>Manage how long your data is stored</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label className="text-base">Auto-delete Data</Label>
                                        <p className="text-sm text-slate-500">Automatically delete data after specified period</p>
                                    </div>
                                    <Switch
                                        checked={settings.autoDelete}
                                        onCheckedChange={(checked) => updateSettings({ autoDelete: checked })}
                                    />
                                </div>

                                {settings.autoDelete && (
                                    <div className="space-y-2">
                                        <Label>Delete After</Label>
                                        <Select
                                            value={settings.deleteAfterMonths.toString()}
                                            onValueChange={(value) => updateSettings({ deleteAfterMonths: parseInt(value) })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="12">12 months</SelectItem>
                                                <SelectItem value="24">24 months</SelectItem>
                                                <SelectItem value="36">36 months</SelectItem>
                                                <SelectItem value="60">60 months</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};