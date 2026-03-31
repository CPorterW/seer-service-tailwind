import { Link } from "react-router-dom"

export function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center">
      <main className="space-y-6">
        <h1 className="on-white mt-4">Welcome to Seer Service Books!</h1>
        <p className="on-white">
          We are glad you are here. This app helps you track your monthly client and vendor activity so you can estimate deductions quickly and confidently.
        </p>

        <section className="w-full rounded-xl border border-slate-200 bg-slate-50 p-6 text-left shadow-sm">
          <h2 className="on-white text-2xl font-semibold">How to get this month&apos;s deduction</h2>
          <ol className="on-white list-decimal space-y-3 pl-5">
            <li>
              Go to<Link to="/clients" className="underline">Clients</Link>and add client addresses.
            </li>
            <li>
              Go to<Link to="/vendors" className="underline">Vendors</Link>and add vendor addresses.
            </li>
            <li>
              Open<Link to="/calculate" className="underline">Calculate</Link>and select the clients and vendors you worked with this month.
            </li>
            <li>
              Enter money earned in the Clients table and money spent in the Vendors table, then click Save.
            </li>
            <li>
              Review the result to see your estimated deductible amount for the selected month.
            </li>
          </ol>
        </section>

        <section className="w-full rounded-xl border border-slate-200 bg-white p-6 text-left shadow-sm">
          <h2 className="on-white text-2xl font-semibold">Helpful tips</h2>
          <ul className="on-white list-disc space-y-3 pl-5">
            <li>
              Keep your addresses updated in<Link to="/clients" className="underline">Clients</Link>and<Link to="/vendors" className="underline">Vendors</Link>so your monthly calculations stay accurate.
            </li>
            <li>
              Use<Link to="/codes" className="underline">Codes</Link>to view all saved tax codes for both clients and vendors in one place.
            </li>
          </ul>
        </section>

        <p className="on-white">
          Need to make changes later? You can revisit any page at any time and recalculate whenever your monthly totals are updated.
        </p>
      </main>
    </div>
  )
}
