export default function TotalCalculator(rates: number[], amounts: number[], grossIncomes: number[]) {
    if (rates.length !== amounts.length) {
        throw new Error("Rates and amounts arrays must have the same length.");
    }

    let totalDeduction = 0;
    let grossTotal = 0;
    let totalIncome = 0;

    for (let i = 0; i < rates.length; i++) {
        const rate = rates[i];
        const amount = amounts[i];
        const gross = grossIncomes[i];

        totalDeduction += amount / rate;
        grossTotal += gross;
    }

    totalIncome = grossTotal - totalDeduction;

    return <p>Total deduction: {totalDeduction}, Total Income: {totalIncome}</p>;
}