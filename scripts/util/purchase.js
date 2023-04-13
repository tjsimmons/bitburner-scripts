/** @param {import("../..").NS} ns */
export async function main(ns) {
  const numServers = ns.args[0];
  const ram = ns.args[1];
  const name = "serv-";

  if (numServers === undefined) {
    ns.toast("numServers must be provided", "error", 3000);
    return;
  }

  if (ram === undefined) {
    ns.toast("RAM must be provided", "error", 3000);
    return;
  }

  for (let i = 0; i < numServers; i++) {
    ns.purchaseServer(name, ram);
  }
}
