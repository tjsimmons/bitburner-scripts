/** @param {import("../..").NS} ns */
export async function main(ns) {
  const target = ns.args[0];

  if (target === undefined) {
    ns.print("ERROR Target must be passed as an argument");
    return;
  }

  const securityThreshhold = ns.getServerMinSecurityLevel(target) + 7;
  const targetMaxMoney = ns.getServerMaxMoney(target);
  const moneyThreshold = targetMaxMoney * 0.5;
  const stopThreshold = targetMaxMoney * 0.25;

  while (true) {
    const moneyAvailable = ns.getServerMoneyAvailable(target);
    const securityLevel = ns.getServerSecurityLevel(target);
    if (securityLevel > securityThreshhold) {
      ns.toast(
        `Weakening ${target} security ${securityLevel.toFixed(
          3
        )} > ${securityThreshhold.toFixed(3)}`,
        "info"
      );

      await ns.weaken(target);
    } else if (moneyAvailable < moneyThreshold) {
      ns.toast(
        `Growing ${target} money ${moneyAvailable.toFixed(
          3
        )} ${moneyThreshold.toFixed(3)}`,
        "info"
      );

      await ns.grow(target);
    } else {
      if (moneyAvailable >= stopThreshold) {
        ns.toast(
          `Hacking ${target} money ${moneyAvailable.toFixed(
            3
          )} / ${moneyThreshold.toFixed(3)}`
        );
        await ns.hack(target);
      } else {
        ns.toast(
          `${target} drained to ${stopThreshold.toFixed(3)}`,
          "success",
          10000
        );
      }
    }
  }
}
