/** @param {import("../..").NS} ns */
export async function main(ns) {
  const target = ns.args[0];

  if (target === undefined) {
    ns.print("ERROR Target must be passed as an argument");
    return;
  }

  const securityThreshhold = ns.getServerMinSecurityLevel(target) + 1;
  const targetMaxMoney = ns.getServerMaxMoney(target);
  const moneyThreshold = targetMaxMoney * 0.9;
  const stopThreshold = targetMaxMoney * 0.7;

  while (true) {
    const moneyAvailable = ns.getServerMoneyAvailable(target);
    const securityLevel = ns.getServerSecurityLevel(target);
    if (securityLevel > securityThreshhold) {
      ns.print(`WARN Security level ${securityLevel} > ${securityThreshhold}`);

      await ns.weaken(target);
    } else if (moneyAvailable < moneyThreshold) {
      ns.print(`WARN Money available ${moneyAvailable} < ${moneyThreshold}`);

      await ns.grow(target);
    } else {
      if (moneyAvailable >= stopThreshold) {
        await ns.hack(target);
      } else {
        ns.print(`SUCCESS %s drained to ${stopThreshold} or less`);
      }
    }
  }
}
