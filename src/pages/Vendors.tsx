
import AddressInput from "../components/AddressInput";
import AddressTable from "../components/AddressTable";


export default function Vendors() {

  return (
    <div className="flex flex-col items-center justify-center">
      <main>
        <AddressInput></AddressInput>
        <AddressTable></AddressTable>
      </main>
    </div>
  )
}
