import { useState } from "react";
import AddressInput from "../components/AddressInput";
import AddressTable from "../components/AddressTable";



export default function Clients() {
  const [refreshToken, setRefreshToken] = useState(0);
  const handleAddressCreated = () => setRefreshToken((prev) => prev + 1);

  return (
    <div className=" flex flex-col items-center justify-center">
      <main>
          <AddressInput isVendor={false} onAddressCreated={handleAddressCreated}></AddressInput>
          <AddressTable isVendor={false} refreshToken={refreshToken}></AddressTable>
      </main>
    </div>
  )
}
