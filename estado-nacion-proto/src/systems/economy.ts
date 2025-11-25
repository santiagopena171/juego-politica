export const calculateEconomy = (
    gdp: number,
    taxRate: number,
    publicSpending: number
) => {
    // Basic logic:
    // Taxes reduce GDP growth but increase revenue.
    // Spending increases GDP growth (multiplier) but costs money.

    const revenue = gdp * taxRate;
    const expenses = publicSpending;
    const budgetSurplus = revenue - expenses;

    // Growth Logic
    // Base growth is 2%.
    // High taxes (> 30%) reduce growth.
    // High spending (> 20% of GDP) increases growth.
    let growthRate = 0.02;

    if (taxRate > 0.3) {
        growthRate -= (taxRate - 0.3) * 0.5; // Penalty
    }

    const spendingRatio = publicSpending / gdp;
    if (spendingRatio > 0.2) {
        growthRate += (spendingRatio - 0.2) * 0.2; // Stimulus
    }

    const newGdp = gdp * (1 + growthRate);

    // Inflation Logic
    // Growth drives inflation.
    let inflation = 0.02 + (growthRate * 0.5);
    if (spendingRatio > 0.4) inflation += 0.02; // Overheating

    return {
        revenue,
        expenses,
        budgetSurplus,
        newGdp,
        inflation,
        growthRate
    };
};
