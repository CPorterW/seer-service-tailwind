import DatePicker from "react-datepicker";
import { useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import AddressTableFull from "../components/AddressTableFull";

export default function Calculate() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  return (
    <div className=" flex flex-col items-center justify-center">
      <main>
        <h1 className="on-white"> <br/> Calculate Your Taxes <br/></h1>
        <p className="on-white">
        </p>
        <p className="on-white">
        Cost of Materials Purchased Per Address:</p>
        <input type="text" placeholder="Cost of Materials Purchased Here"/> <br/> <br/> 
        <p className="on-white">
        Per Code:</p>

        <AddressTableFull month={selectedDate.getMonth() + 1} year={selectedDate.getFullYear()}></AddressTableFull>
        
        <p className="on-white">Date:</p>
        <DatePicker
          selected={selectedDate}
          onChange={(date) => date && setSelectedDate(date)}
          dateFormat="MM/yyyy"
          showMonthYearPicker
        />
      </main>
    </div>
  )
}
