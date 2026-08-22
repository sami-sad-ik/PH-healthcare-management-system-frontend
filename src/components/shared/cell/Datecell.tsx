import { format } from "date-fns";

interface DatecellProps {
  date: Date | string;
  formatString?: string;
}

const Datecell = ({ date, formatString }: DatecellProps) => {
  if (!date) return <span className="text-sm text-muted-foreground">-</span>;

  const formattedDate = format(new Date(date), formatString || "MM dd, yyyy");

  return <span className="text-sm">{formattedDate}</span>;
};

export default Datecell;
