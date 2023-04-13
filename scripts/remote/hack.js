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
        `${target} security ${securityLevel} > ${securityThreshhold}`,
        "info"
      );

      await ns.weaken(target);
    } else if (moneyAvailable < moneyThreshold) {
      ns.toast(`${target} money ${moneyAvailable} < ${moneyThreshold}`, "info");

      await ns.grow(target);
    } else {
      if (moneyAvailable >= stopThreshold) {
        await ns.hack(target);
      } else {
        ns.toast(
          `${target} drained to ${stopThreshold} or less`,
          "success",
          10000
        );
      }
    }
  }
}
