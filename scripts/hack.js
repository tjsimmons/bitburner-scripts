/** @param {import("..").NS} ns */
export async function main(ns) {
  const target = ns.args[0];
  const hackThresholdPercent = ns.args[1];

  if (target === undefined) {
    ns.toast("Target must be passed as an argument", "error", 3000);
    return;
  }

  if (hackThresholdPercent === undefined) {
    ns.toast(
      "hackThresholdPercent must be passed as an argument",
      "error",
      3000
    );
    return;
  }

  let moneyAvailable = ns.getServerMoneyAvailable(target);
  const hackThreshold =
    ns.getServerMaxMoney(target) * (hackThresholdPercent / 100);

  while (moneyAvailable >= hackThreshold) {
    ns.toast(
      `Hacking ${target} ${moneyAvailable.toFixed(3)} / ${hackThreshold.toFixed(
        3
      )}`,
      "info",
      10000
    );

    await ns.hack(target);

    moneyAvailable = ns.getServerMoneyAvailable(target);
  }

  ns.toast(
    `${target} drained to ${hackThreshold.toFixed(3)}`,
    "success",
    10000
  );
}
