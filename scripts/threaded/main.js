/** @param {import("../..").NS} ns */
export async function main(ns) {
  const target = ns.args[0];
  const minSecLevelPad = ns.args[1];
  const growThresholdPercent = ns.args[2];
  const stopThresholdPercent = ns.args[3];
  const hostname = ns.getHostname();

  if (target === undefined) {
    ns.toast("Target must be passed as an argument", "error");
    return;
  }

  if (minSecLevelPad === undefined) {
    ns.toast("minSecLevelPad must be passed as an argument", "error");
    return;
  }

  if (growThresholdPercent === undefined) {
    ns.toast("growThresholdPercent must be passed as an argument", "error");
    return;
  }

  if (stopThresholdPercent === undefined) {
    ns.toast("stopThresholdPercent must be passed as an argument", "error");
    return;
  }

  const hostMaxRam = ns.getServerMaxRam(hostname);
  let ramFree = hostMaxRam - ns.getServerUsedRam(hostname);

  const weakenPath = "/scripts/weaken.js";
  const weakenCost = ns.getScriptRam(weakenPath);
  const weakenWeight = 0.5;
  let weakenThreads = 1;
  let weakenRunning = false;

  const growPath = "/scripts/grow.js";
  const growCost = ns.getScriptRam(growPath);
  let growThreads = 1;
  let growRunning = false;

  const hackPath = "/scripts/hack.js";
  const hackCost = ns.getScriptRam(hackPath);
  let hackThreads = 1;
  let hackCanRun = false;
  let hackRunning = ns.scriptRunning(hackPath, hostname);

  ns.toast(
    `Weaken cost: ${weakenCost}\r\nGrow cost: ${growCost}\r\nHack cost: ${hackCost}`,
    "info",
    5000
  );

  // loop here
  while (true) {
    ramFree = hostMaxRam - ns.getServerUsedRam(hostname);
    weakenRunning = ns.scriptRunning(weakenPath, hostname);
    growRunning = ns.scriptRunning(growPath, hostname);
    hackRunning = ns.scriptRunning(hackPath, hostname);
    hackCanRun = !weakenRunning && !growRunning && !hackRunning;

    if (!weakenRunning) {
      weakenThreads = Math.max(
        Math.floor((ramFree * weakenWeight) / weakenCost),
        1
      );

      ns.run(weakenPath, weakenThreads, target, minSecLevelPad);
      ns.toast(`${target} WEAKEN (${weakenThreads} threads)`, "success");

      ramFree -= weakenCost * weakenThreads;
    }

    if (!growRunning) {
      growThreads = Math.max(Math.floor(ramFree / growCost), 1);

      ns.run(growPath, growThreads, target, growThresholdPercent);
      ns.toast(`${target} GROW (${growThreads} threads)`, "success");
    }

    do {
      weakenRunning = ns.scriptRunning(weakenPath, hostname);
      growRunning = ns.scriptRunning(growPath, hostname);

      hackCanRun = !weakenRunning && !growRunning;

      await ns.sleep(1000);
    } while (!hackCanRun);

    if (!hackRunning && hackCanRun) {
      ramFree = hostMaxRam - ns.getServerUsedRam(hostname);

      hackThreads = Math.max(Math.floor(ramFree / hackCost), 1);

      ns.run(hackPath, hackThreads, target, stopThresholdPercent);
      ns.toast(`${target} HACK (${hackThreads} threads)`, "success");

      do {
        hackRunning = ns.scriptRunning(hackPath, hostname);

        await ns.sleep(1000);
      } while (hackRunning);
    }

    await ns.sleep(1000);
  }
}
