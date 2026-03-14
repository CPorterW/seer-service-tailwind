import { lazy, Suspense, useState } from "react";
const AddressTableFull = lazy(() => import("../components/AddressTableFull"));
const MonthYearPicker = lazy(() => import("../components/MonthYearPicker"));

export default function Calculate() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  return (
    <div className=" flex flex-col items-center justify-center">
      <main>
        <h1 className="on-white"> <br/> Calculate Your Taxes <br/></h1>
        <p className="on-white">
        Cost of Materials Purchased Per Address:</p>
        <input type="text" placeholder="Cost of Materials Purchased Here"/> <br/> <br/> 
        <p className="on-white">
        Per Code:</p>
        <Suspense fallback={<p className="on-white">Loading table...</p>}>
          <AddressTableFull month={selectedDate.getMonth() + 1} year={selectedDate.getFullYear()} />
        </Suspense>
        <AddressTableFull month={selectedDate.getMonth() + 1} year={selectedDate.getFullYear()}></AddressTableFull>
        
        <p className="on-white">Date:</p>
        <Suspense fallback={<p className="on-white">Loading date picker...</p>}>
          <MonthYearPicker selectedDate={selectedDate} onChange={setSelectedDate} />
        </Suspense>
      </main>
    </div>
  )
}
