import { Calendar } from "@/components/ui/calendar"
import {
    SidebarGroup,
    SidebarGroupContent,
} from "@/components/ui/sidebar"

export function DatePicker({ date, setDate }: { date: Date | undefined, setDate: (date: Date | undefined) => void }) {
    return (
        <SidebarGroup className="px-0">
            <SidebarGroupContent>
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="[&_[role=gridcell].bg-accent]:bg-sidebar-primary [&_[role=gridcell].bg-accent]:text-sidebar-primary-foreground [&_[role=gridcell]]:w-[33px]"
                />
            </SidebarGroupContent>
        </SidebarGroup>
    )
}
