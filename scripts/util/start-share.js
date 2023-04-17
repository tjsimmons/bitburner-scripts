/** @param {import("../..").NS} ns */
export async function main(ns) {
  const hostname = ns.getHostname();
  const shareScript = "/scripts/util/share.js";
  const shareCost = ns.getScriptRam(shareScript);
  const thisCost = ns.getScriptRam("/scripts/util/start-share.js");
  const hostRam =
    ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname) + thisCost;
  const percentReserve = ns.args[0] / 100;
  const shareRam = 1 - percentReserve;
  const shareThreads = Math.floor((hostRam * shareRam) / shareCost);

  ns.toast(`Starting share on ${hostname} (${shareThreads} threads)`);
  ns.spawn(shareScript, shareThreads);
}
