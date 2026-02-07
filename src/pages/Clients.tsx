import AddressInput from "../components/AddressInput";
import AddressTable from "../components/AddressTable";



export default function Clients() {

  return (
    <div className=" flex flex-col items-center justify-center">
      <main>
          <AddressInput isVendor={false}></AddressInput>
          <AddressTable isVendor={false}></AddressTable>
      </main>
    </div>
  )
}
