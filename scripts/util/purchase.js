/** @param {import("../..").NS} ns */
export async function main(ns) {
  const name = ns.args[0];
  const ram = ns.args[1];

  if (ram === undefined) {
    ns.toast("RAM must be provided", "error", 3000);
    return;
  }

  let newServer = ns.purchaseServer(name, ram);
  if (newServer !== "" && newServer !== undefined && newServer !== null) {
    ns.toast(`${newServer} purchased with ${ram}GB RAM`, "success", 5000);
  } else {
    ns.toast("Unable to purchase new server", "error", 5000);
  }
}
