/** @param {import("../..").NS} ns */
export async function main(ns) {
  const numServers = ns.args[0];
  const ram = ns.args[1];
  const name = "serv-";

  if (numServers === undefined) {
    ns.print("ERROR numServers must be provided");
    return;
  }

  if (ram === undefined) {
    ns.print("ERROR RAM must be provided");
    return;
  }

  for (let i = 0; i < numServers; i++) {
    ns.purchaseServer(name, ram);
  }
}
