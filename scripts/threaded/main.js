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
  let weakenThreads = 1;
  let weakenRunning = false;

  const growEnabled = growThresholdPercent > -1;
  const growPath = "/scripts/grow.js";
  const growCost = ns.getScriptRam(growPath);
  let growThreads = 1;
  let growRunning = false;

  const hackEnabled = hackThresholdPercent > -1;
  const hackPath = "/scripts/hack.js";
  const hackCost = ns.getScriptRam(hackPath);
  let hackThreads = 1;
  let hackCanRun = false;
  let hackRunning = ns.scriptRunning(hackPath, hostname);

  const weakenWeight = growEnabled ? 0.2 : 1;

  // loop here
  while (true) {
    ramFree = hostMaxRam - ns.getServerUsedRam(hostname);
    weakenRunning = ns.scriptRunning(weakenPath, hostname);
    growRunning = ns.scriptRunning(growPath, hostname);
    hackRunning = ns.scriptRunning(hackPath, hostname);
    hackCanRun = !weakenRunning && !growRunning && !hackRunning;

    if (weakenEnabled && !weakenRunning) {
      weakenThreads = Math.max(
        Math.floor((ramFree * weakenWeight) / weakenCost),
        1
      );

      ns.run(weakenPath, weakenThreads, target, minWeakenPad);
      ns.toast(`${target} WEAKEN (${weakenThreads} threads)`, "success");

      ramFree -= weakenCost * weakenThreads;
    }

    if (growEnabled && !growRunning) {
      growThreads = Math.max(Math.floor(ramFree / growCost), 1);

      ns.run(growPath, growThreads, target, growThresholdPercent);
      ns.toast(`${target} GROW (${growThreads} threads)`, "success");
    }

    if (hackEnabled) {
      do {
        weakenRunning = ns.scriptRunning(weakenPath, hostname);
        growRunning = ns.scriptRunning(growPath, hostname);

        hackCanRun = !weakenRunning && !growRunning;

        await ns.sleep(1000);
      } while (!hackCanRun);

      if (!hackRunning && hackCanRun) {
        ramFree = hostMaxRam - ns.getServerUsedRam(hostname);

        hackThreads = Math.max(Math.floor(ramFree / hackCost), 1);

        ns.run(hackPath, hackThreads, target, hackThresholdPercent);
        ns.toast(`${target} HACK (${hackThreads} threads)`, "success");

        do {
          hackRunning = ns.scriptRunning(hackPath, hostname);

          await ns.sleep(1000);
        } while (hackRunning);
      }
    }

    await ns.sleep(60000);
  }
}
