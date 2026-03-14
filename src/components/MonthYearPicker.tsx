import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type MonthYearPickerProps = {
  selectedDate: Date;
  onChange: (date: Date) => void;
};

export default function MonthYearPicker({ selectedDate, onChange }: MonthYearPickerProps) {
  return (
    <DatePicker
      selected={selectedDate}
      onChange={(date) => date && onChange(date)}
      dateFormat="MM/yyyy"
      showMonthYearPicker
    />
  );
}
