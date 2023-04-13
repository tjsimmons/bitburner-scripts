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
    let newServer = ns.purchaseServer(name + i, ram);
    if (newServer !== "" && newServer !== undefined && newServer !== null) {
      ns.toast(`${newServer} purchased with ${ram}GB RAM`, "success", 5000);
    } else {
      ns.toast("Unable to purchase new server", "error", 5000);
    }
  }
}
