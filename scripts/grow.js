/** @param {import("..").NS} ns */
export async function main(ns) {
  const target = ns.args[0];
  const thresholdPercent = ns.args[1];

  if (target === undefined) {
    ns.toast("Target must be passed as an argument", "error", 3000);
    return;
  }

  if (thresholdPercent === undefined) {
    ns.toast("thresholdPercent must be passed as an argument", "error", 3000);
    return;
  }

  const maxMoney = ns.getServerMaxMoney(target);
  let currentMoney = ns.getServerMoneyAvailable(target);
  let pastThreshold = isPastThreshold(currentMoney, maxMoney, thresholdPercent);

  while (!pastThreshold) {
    ns.toast(`Growing ${target} ${currentMoney} / ${maxMoney}`, "info", 10000);

    await ns.grow(target);

    currentMoney = ns.getServerMoneyAvailable(target);
    pastThreshold = isPastThreshold(currentMoney, maxMoney, thresholdPercent);
  }

  ns.toast(`${target} grown to ${currentMoney}`, "success", 10000);
}

const isPastThreshold = (current, max, threshold) =>
  current >= max * (threshold / 100);
