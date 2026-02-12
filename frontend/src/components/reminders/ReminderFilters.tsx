import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface ReminderFiltersProps {
  filters: { status: string; priority: string; category: string; date: string };
  onChange: (filters: { status: string; priority: string; category: string; date: string }) => void;
}

const ReminderFilters = ({ filters, onChange }: ReminderFiltersProps) => {
  const update = (key: string, value: string) => onChange({ ...filters, [key]: value });

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={filters.status} onValueChange={(v) => update("status", v)}>
        <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="overdue">Overdue</SelectItem>
        </SelectContent>
      </Select>
      <Select value={filters.priority} onValueChange={(v) => update("priority", v)}>
        <SelectTrigger className="w-[140px]"><SelectValue placeholder="Priority" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priority</SelectItem>
          <SelectItem value="low">Low</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="high">High</SelectItem>
        </SelectContent>
      </Select>
      <Select value={filters.category} onValueChange={(v) => update("category", v)}>
        <SelectTrigger className="w-[140px]"><SelectValue placeholder="Category" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="work">Work</SelectItem>
          <SelectItem value="personal">Personal</SelectItem>
          <SelectItem value="health">Health</SelectItem>
          <SelectItem value="finance">Finance</SelectItem>
          <SelectItem value="other">Other</SelectItem>
        </SelectContent>
      </Select>
      <Input type="date" className="w-[160px]" value={filters.date} onChange={(e) => update("date", e.target.value)} />
    </div>
  );
};

export default ReminderFilters;
