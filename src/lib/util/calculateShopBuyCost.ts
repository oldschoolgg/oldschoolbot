export function calculateShopBuyCost(
  gpCost: number,
  quantity: number,
  shopQuantity?: number,
  changePer?: number
): { total: number; average: number } {
  if (!shopQuantity || !changePer) {
    const total = gpCost * quantity;
    return { total, average: total / quantity };
  }
  let total = 0;
  let price = gpCost;
  const multiplier = 1 + changePer / 100;
  for (let i = 0; i < quantity; i++) {
    total += Math.floor(price);
    price *= multiplier;
    if ((i + 1) % shopQuantity === 0) {
      price = gpCost;
    }
  }
  return { total, average: total / quantity };
}
export default calculateShopBuyCost;
