/** @param {import("../..").NS} ns */
export async function main(ns) {
  const target = ns.args[0];
  const growThresholdPercent = ns.args[1];
  const stopThresholdPercent = ns.args[2];
  const hostname = ns.getHostname();

  if (target === undefined) {
    ns.toast("Target must be passed as an argument", "error");
    return;
  }

  if (growThresholdPercent === undefined) {
    ns.toast("growThresholdPercent must be passed as an argument", "error");
    return;
  }

  const weakenPath = "/scripts/weaken.js";
  const weakenCost = ns.getScriptRam(weakenPath);
  const weakenWeight = 0.5;
  let weakenThreads = 1;
  let weakenPID = 0;

  const growPath = "/scripts/grow.js";
  const growCost = ns.getScriptRam(growPath);
  const growWeight = 0.5;
  let growThreads = 1;
  let growPID = 0;

  const hackPath = "/scripts/hack.js";
  const hackCost = ns.getScriptRam(hackPath);
  let hackPID = 0;
  let hackRunning = false;

  ns.print(
    `INFO Weaken cost: ${weakenCost}\r\nGrow cost: ${growCost}\r\nHack cost: ${hackCost}`
  );

  // loop here
  while (true) {
    let ramFree = ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname);
    let hackCanRun = false;

    weakenThreads = Math.max(
      Math.floor((ramFree * weakenWeight) / weakenCost),
      1
    );

    ramFree -= weakenCost * weakenThreads;

    weakenPID = ns.run(weakenPath, weakenThreads, target);

    if (weakenPID > 0) {
      ns.toast(
        `Weaken PID ${weakenPID} with ${weakenThreads} threads`,
        "success"
      );
    }

    await ns.sleep(5000);

    if (ns.isRunning(weakenPID)) {
      growThreads = Math.max(Math.floor((ramFree * growWeight) / growCost), 1);
    } else {
      ramFree = ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname);
      growThreads = Math.max(Math.floor(ramFree / growCost), 1);
    }

    growPID = ns.run(growPath, growThreads, target, growThresholdPercent);

    if (growPID > 0) {
      ns.toast(`Grow PID ${growPID} with ${growThreads} threads`, "success");
    }

    await ns.sleep(5000);

    while (!hackCanRun) {
      if (!ns.isRunning(weakenPID)) {
        weakenPID = 0;
      }

      if (!ns.isRunning(growPID)) {
        growPID = 0;
      }

      hackCanRun = weakenPID === 0 && growPID === 0;

      await ns.sleep(1000);
    }

    ramFree = ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname);

    const hackThreads = Math.max(Math.floor(ramFree / hackCost), 1);

    hackPID = ns.run(hackPath, hackThreads, target, stopThresholdPercent);

    if (hackPID > 0) {
      ns.toast(`Hack PID ${hackPID} with ${hackThreads} threads`, "success");
    }

    while (hackRunning) {
      if (!ns.isRunning(hackPID)) {
        hackPID = 0;
      }

      hackRunning = hackPID === 0;

      await ns.sleep(5000);
    }

    await ns.sleep(1000);
  }
}
