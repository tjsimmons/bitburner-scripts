/**
 * This is the main entry point for remote, not main
 */

/** @param {import("../..").NS} ns */
export async function main(ns) {
  const owned = [
    "n00dles",
    "foodnstuff",
    "sigma-cosmetics",
    "joesguns",
    "hong-fang-tea",
    "harakiri-sushi",
    "zer0",
    "nectar-net",
    "iron-gym",
    "max-hardware",
    //"csec",
  ];

  for (const target of owned) {
    await runScript(ns, target);
  }
}

/** @param {import("../..").NS} ns */
async function runScript(ns, target) {
  const mainScript = "/scripts/remote/main.js";
  const hackScript = "/scripts/remote/hack.js";

  if (ns.fileExists("BruteSSH.exe", "home")) {
    ns.brutessh(target);
  }

  ns.nuke(target);

  if (!ns.scriptRunning(hackScript, target)) {
    ns.print(`Executing remote script on ${target}`);
    ns.run(mainScript, 1, target);
    await ns.sleep(15000);
  } else {
    ns.print(`Script already running on ${target}`);
  }
}
