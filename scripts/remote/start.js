/**
 * This is the main entry point for remote, not main
 */

/** @param {import("../..").NS} ns */
export async function main(ns) {
  const owned = [
    "n00dles",
    /*"foodnstuff",
    "sigma-cosmetics",
    "joesguns",
    "hong-fang-tea",
    "harakiri-sushi",
    "nectar-net",
    "zer0",
    "iron-gym",
    "max-hardware",
    //"neo-net",
    /*"phantasy",
    "silver-helix",*/
    //"csec",
  ];

  for (const target of owned) {
    await runScript(ns, target);
  }
}

/** @param {import("../..").NS} ns */
const runScript = async (ns, target) => {
  const mainScript = "/scripts/remote/main.js";
  const hackScript = "/scripts/remote/hack.js";

  if (ns.fileExists("BruteSSH.exe", "home")) {
    ns.brutessh(target);
  }

  if (ns.fileExists("FTPCrack.exe", "home")) {
    ns.ftpcrack(target);
  }

  ns.nuke(target);

  if (!ns.scriptRunning(hackScript, target)) {
    ns.toast(`Executing remote script on ${target}`, "info");
    ns.run(mainScript, 1, target);
    await ns.sleep(5000);
  } else {
    ns.toast(`Script already running on ${target}`, "error");
  }
};
