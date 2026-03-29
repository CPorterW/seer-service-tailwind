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
          Use the dropdowns below to add clients and vendors for this month.
          Enter money made in the Clients table and money spent in the Vendors table, then click Save.
        </p>
        <p className="on-white">Date:</p>
        <Suspense fallback={<p className="on-white">Loading date picker...</p>}>
          <MonthYearPicker selectedDate={selectedDate} onChange={setSelectedDate} />
        </Suspense>
        <p className="on-white">Monthly Amounts:</p>
        <Suspense fallback={<p className="on-white">Loading table...</p>}>
          <AddressTableFull month={selectedDate.getMonth() + 1} year={selectedDate.getFullYear()} />
        </Suspense>
      </main>
    </div>
  )
}
