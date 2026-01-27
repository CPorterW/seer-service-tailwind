import AddressTable from "../components/AddressTable";


export default function Codes() {

  return (
    <div className=" flex flex-col items-center justify-center">
      <main>
        <h1 className="on-white"> <br/> All Your Tax Codes In One Place <br/></h1>
        <p className="on-white">
          <AddressTable></AddressTable>
        </p>
      </main>
    </div>
  )
}
