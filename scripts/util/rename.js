/** @param {import("../..").NS} ns */
export async function main(ns) {
  const oldName = ns.args[0];
  const newName = ns.args[1];

  if (oldName === undefined) {
    ns.toast("oldName must be passed as an argument", "error", 5000);
    return;
  }

  if (newName === undefined) {
    ns.toast("newName must be passed as an argument", "error", 5000);
    return;
  }

  if (ns.renamePurchasedServer(oldName, newName)) {
    ns.toast(`Successfully renamed ${oldName} to ${newName}`, "success", 5000);
  } else {
    ns.toast(`Unable to rename ${oldName}`, "error", 5000);
  }
}
