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
  for (let i = 0; i < quantity; i++) {
    const itemsBoughtThisWorld = i % shopQuantity;
    const price = Math.floor(gpCost * (1 + (changePer / 100) * itemsBoughtThisWorld));
    total += price;
  }

  return { total, average: total / quantity };
}

export default calculateShopBuyCost;
