/** @param {import("../..").NS} ns */
export async function main(ns) {
  const target = ns.args[0];

  if (target === undefined) {
    ns.print("ERROR Target must be passed as an argument");
    return;
  }

  const hackPath = "/scripts/remote/hack.js";
  const hackCost = ns.getScriptRam(hackPath);
  const targetMaxRam = ns.getServerMaxRam(target);
  const targetUsedRam = ns.getServerUsedRam(target);
  const targetFreeRam = targetMaxRam - targetUsedRam;
  const numThreads = Math.max(Math.floor(targetFreeRam / hackCost), 1);

  ns.printf(
    "Target: %s\r\nMax RAM: %f\r\nUsed RAM: %f\r\nFree RAM: %f\r\nHack Cost: %f\r\nnumThreads: %d",
    target,
    targetMaxRam,
    targetUsedRam,
    targetFreeRam,
    hackCost,
    numThreads
  );

  ns.scp(hackPath, target);
  ns.exec(hackPath, target, numThreads, target);
}
