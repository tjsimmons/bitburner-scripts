/** @param {import("../..").NS} ns */
export async function main(ns) {
  const target = ns.args[0];
  let ram = ns.args[1];

  if (target === undefined) {
    ns.toast("Target must be passed as an argument", "error", 5000);
    return;
  }

  if (ram === undefined) {
    ram = ns.getServerMaxRam(target) * 2;
  }

  if (ns.upgradePurchasedServer(target, ram)) {
    ns.toast(`Upgraded ${target} to ${ram}GB`, "success", 5000);
  } else {
    const cost = ns.getPurchasedServerUpgradeCost(target, ram);
    ns.toast(
      `Unable to upgrade ${target} to ${ram}GB, requires $${cost}`,
      "error",
      5000
    );
  }
}
