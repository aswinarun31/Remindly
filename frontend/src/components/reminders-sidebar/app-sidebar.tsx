import * as React from "react"
import { Plus } from "lucide-react"

import { Calendars } from "./calendars"
import { DatePicker } from "./date-picker"
import { NavUser } from "./nav-user"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarSeparator,
    SidebarTrigger,
    useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

// This is sample data.
const data = {
    user: {
        name: "shadcn",
        email: "m@example.com",
        avatar: "/avatars/shadcn.jpg",
    },
    calendars: [
        {
            name: "My Calendars",
            items: ["Personal", "Work", "Family"],
        },
        {
            name: "Favorites",
            items: ["Holidays", "Birthdays"],
        },
        {
            name: "Other",
            items: ["Travel", "Reminders", "Deadlines"],
        },
    ],
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    date: Date | undefined
    setDate: (date: Date | undefined) => void
    onViewWeek?: () => void
}

export function AppSidebar({ date, setDate, onViewWeek, ...props }: AppSidebarProps) {
    const { state, setOpen } = useSidebar()
    return (
        <>
            <Sidebar
                {...props}
                style={{ "--sidebar-width": "18rem" } as React.CSSProperties}
                className="
    h-[370px] 
    top-28 
    left-3
    bg-background
    border border-border
    rounded-2xl
    shadow-lg
    shadow-black/5
    overflow-hidden
  "
            >

                <SidebarContent>
                    <DatePicker date={date} setDate={setDate} />

                    <SidebarMenuButton onClick={onViewWeek} className="bg-primary text-primary-foreground w-full">
                        <Plus />
                        <span className="text-sm font-medium items-center">View My Week</span>
                    </SidebarMenuButton>

                    {/* <Calendars calendars={data.calendars} /> */}

                </SidebarContent>
                <SidebarFooter>
                    <SidebarMenu>
                        <SidebarMenuItem>

                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
                <SidebarRail />
                <div className="absolute bottom-1 right-2 z-50">
                    <SidebarTrigger className="
      h-10 w-10
    rounded-full
    border
    bg-background
    shadow-md
    hover:shadow-lg
    transition
  " />
                </div>
            </Sidebar>
            {state === "collapsed" && (
                <Button

                    className="fixed left-4 top-24 z-50 mb-4"
                    onClick={() => setOpen(true)}
                >
                    View Calendar
                </Button>
            )}
        </>
    )
}
