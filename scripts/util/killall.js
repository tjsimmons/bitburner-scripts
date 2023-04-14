import AllHosts from "/scripts/lib/Hosts";

/** @param {import("../..").NS} ns */
export async function main(ns) {
  for (const { name } of AllHosts) {
    ns.toast(`Killing all scripts on ${name}`, "error");
    ns.killall(name);
  }
}
