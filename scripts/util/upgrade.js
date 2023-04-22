/** @param {import("../..").NS} ns */
export async function main(ns) {
  let ram = ns.args[0];

  for (const server of ns.getPurchasedServers()) {
    if (ram === undefined) {
      ram = ns.getServerMaxRam(server) * 2;
    }

    if (ns.upgradePurchasedServer(server, ram)) {
      ns.toast(`Upgraded ${server} to ${ram}GB`, "success", 5000);
    } else {
      const cost = ns.getPurchasedServerUpgradeCost(server, ram);
      ns.toast(
        `Unable to upgrade ${server} to ${ram}GB, requires $${cost}`,
        "error",
        5000
      );
    }
  }
}
