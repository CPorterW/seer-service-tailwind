import { useEffect, useState } from "react";
import { getAddresses, deleteAddress } from "../services/addressService";

export default function AddressList() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [addresses, setAddresses] = useState<any[]>([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const data = await getAddresses();
    setAddresses(data);
  }

  async function remove(id: number) {
    await deleteAddress(id);
    await load();
  }

  return (
    <div>
        <h3>Address List:</h3>
      {addresses.map(a => (
        <div key={a.id}>
          {a.street} ({a.zip_code}) — last used {a.last_used} <br/>
          <button onClick={() => remove(a.id)}>Delete</button> <br/>
        </div>
      ))} <br/>
    </div>
  );
}