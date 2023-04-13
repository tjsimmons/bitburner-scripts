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

  ns.toast(
    `Target: ${target}\r\nMax RAM: ${targetMaxRam}\r\nUsed RAM: ${targetUsedRam}\r\nFree RAM: ${targetFreeRam}\r\nHack Cost: ${hackCost}\r\nnumThreads: ${numThreads}`,
    "info"
  );

  ns.scp(hackPath, target);
  ns.exec(hackPath, target, numThreads, target);
}
