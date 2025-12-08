
import AddressList from "../components/AddressList";
import AddressTable from "../components/AddressTable";


export default function Vendors() {

  return (
    <div className="flex flex-col items-center justify-center">
      <main>
        <AddressList></AddressList>
        <AddressTable></AddressTable>
      </main>
    </div>
  )
}
