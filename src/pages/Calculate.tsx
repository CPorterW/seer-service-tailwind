


export default function Calculate() {

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
        <input type="text" placeholder="Income By Code"/>
        <p className="on-white">
        Total Post Deduction: $18,626.68</p> <br/>
        <p className="on-white">
        Total Gross:</p>
        <input type="text" placeholder="Total Gross" />
        <p className="on-white">
        Total Net: $27,303.76</p>
      </main>
    </div>
  )
}
