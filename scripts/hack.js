/** @param {import("..").NS} ns */
export async function main(ns) {
  const target = ns.args[0];
  const stopThresholdPercent = ns.args[1];

  if (target === undefined) {
    ns.toast("Target must be passed as an argument", "error", 3000);
    return;
  }

  if (stopThresholdPercent === undefined) {
    ns.toast(
      "stopThresholdPercent must be passed as an argument",
      "error",
      3000
    );
    return;
  }

  let moneyAvailable = ns.getServerMoneyAvailable(target);
  const stopThreshold =
    ns.getServerMaxMoney(target) * (stopThresholdPercent / 100);

  while (moneyAvailable >= stopThreshold) {
    ns.toast(
      `${target} money available: ${moneyAvailable} / ${stopThreshold}`,
      "info"
    );

    await ns.hack(target);

    moneyAvailable = ns.getServerMoneyAvailable(target);
  }

  ns.toast(`${target} drained to ${stopThreshold} or less`, "error");
}
