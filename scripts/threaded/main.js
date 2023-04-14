/*
 * The last 3 parameters, if set to -1, will disable that individual script
 */

/** @param {import("../..").NS} ns */
export async function main(ns) {
  const target = ns.args[0];
  const minWeakenPad = ns.args[1];
  const growThresholdPercent = ns.args[2];
  const hackThresholdPercent = ns.args[3];
  const hostname = ns.getHostname();

  if (target === undefined) {
    ns.toast("Target must be passed as an argument", "error");
    return;
  }

  if (minWeakenPad === undefined) {
    ns.toast("minWeakenPad must be passed as an argument", "error");
    return;
  }

  if (growThresholdPercent === undefined || growThresholdPercent === 0) {
    ns.toast(
      "growThresholdPercent must be passed as an argument and be > 0",
      "error"
    );
    return;
  }

  if (hackThresholdPercent === undefined) {
    ns.toast("hackThresholdPercent must be passed as an argument", "error");
    return;
  }

  const hostMaxRam = ns.getServerMaxRam(hostname);
  let ramFree = hostMaxRam - ns.getServerUsedRam(hostname);

  const weakenEnabled = minWeakenPad > -1;
  const weakenPath = "/scripts/weaken.js";
  const weakenCost = ns.getScriptRam(weakenPath);
  let weakenPID = 0;
  let weakenThreads = 1;
  let weakenRunning = false;

  const growEnabled = growThresholdPercent > -1;
  const growPath = "/scripts/grow.js";
  const growCost = ns.getScriptRam(growPath);
  let growPID = 0;
  let growThreads = 1;
  let growRunning = false;

  const hackEnabled = hackThresholdPercent > -1;
  const hackPath = "/scripts/hack.js";
  const hackCost = ns.getScriptRam(hackPath);
  let hackPID = 0;
  let hackThreads = 1;
  let hackRunning = false;

  let weakenWeight = 0;
  let growWeight = 0;
  let hackWeight = 0;

  if (weakenEnabled && !growEnabled && !hackEnabled) {
    weakenWeight = 1;
  } else if (weakenEnabled && growEnabled && !hackEnabled) {
    weakenWeight = 0.2;
    growWeight = 0.8;
  } else if (weakenEnabled && !growEnabled && hackEnabled) {
    weakenWeight = 0.2;
    hackWeight = 0.8;
  } else if (!weakenEnabled && growEnabled && !hackEnabled) {
    growWeight = 1;
  } else if (!weakenEnabled && growEnabled && hackEnabled) {
    growWeight = 0.6;
    hackWeight = 0.4;
  } else if (!weakenEnabled && !growEnabled && hackEnabled) {
    hackWeight = 1;
  } else if (weakenEnabled && growEnabled && hackEnabled) {
    weakenWeight = 0.2;
    growWeight = 0.5;
    hackWeight = 0.3;
  }

  /*if (weakenWeight + growWeight + hackWeight != 1) {
    ns.alert(
      `Weights are incorrect in threaded/main.js for weaken/grow/hack ${weakenWeight}/${growWeight}/${hackWeight}\r\n
       Weaken Enabled: ${weakenEnabled}\r\n
       Grow Enabled: ${growEnabled}\r\n
       Hack Enabled: ${hackEnabled}`
    );
  }*/

  // loop here
  while (true) {
    ramFree = hostMaxRam - ns.getServerUsedRam(hostname);
    weakenRunning = ns.isRunning(weakenPID, hostname);
    growRunning = ns.isRunning(growPID, hostname);
    hackRunning = ns.isRunning(hackPID, hostname);

    weakenThreads = Math.max(
      Math.floor((ramFree * weakenWeight) / weakenCost),
      1
    );
    growThreads = Math.max(Math.floor((ramFree * growWeight) / growCost), 1);
    hackThreads = Math.max(Math.floor((ramFree * hackWeight) / hackCost), 1);

    if (weakenEnabled && !weakenRunning) {
      weakenPID = ns.run(weakenPath, weakenThreads, target, minWeakenPad);
      ns.toast(`${target} WEAKEN (${weakenThreads} threads)`, "success");
    }

    if (growEnabled && !growRunning) {
      growPID = ns.run(growPath, growThreads, target, growThresholdPercent);
      ns.toast(`${target} GROW (${growThreads} threads)`, "success");
    }

    if (hackEnabled && !hackRunning) {
      hackPID = ns.run(hackPath, hackThreads, target, hackThresholdPercent);
      ns.toast(`${target} HACK (${hackThreads} threads)`, "success");
    }

    await ns.sleep(10000);
  }
}
