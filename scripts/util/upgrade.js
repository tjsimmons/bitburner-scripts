/** @param {import("../..").NS} ns */
export async function main(ns) {
  const target = ns.args[0];
  const ram = ns.args[1];

  if (target === undefined) {
    ns.print("ERROR Target must be passed as an argument");
    return;
  }

  if (ram === undefined) {
    ns.print("ERROR RAM must be passed as an argument");
    return;
  }

  ns.upgradePurchasedServer(target, ram);
}
