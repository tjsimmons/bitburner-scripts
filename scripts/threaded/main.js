import Weight from "/scripts/lib/Weights";

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
  let tertiaryGrowRunning = false;
  let tertiaryGrowPID = 0;
  let tertiaryGrowThreads = 1;

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
  let secondaryGrowRunning = false;
  let secondaryGrowPID = 0;
  let secondaryGrowThreads = 1;

  let weakenWeight = 0;
  let growWeight = 0;
  let hackWeight = 0;

  // at the moment, we're only using the individual functions by themselves - no combined
  // so we're using the lib export to handle those
  if (weakenEnabled && !growEnabled && !hackEnabled) {
    weakenWeight = Weight.Full;
  } else if (weakenEnabled && growEnabled && !hackEnabled) {
    weakenWeight = Weight.Weaken;
    growWeight = 0.8;
  } else if (weakenEnabled && !growEnabled && hackEnabled) {
    weakenWeight = Weight.Weaken;
    hackWeight = 0.8;
  } else if (!weakenEnabled && growEnabled && !hackEnabled) {
    growWeight = Weight.Full;
  } else if (!weakenEnabled && growEnabled && hackEnabled) {
    growWeight = 0.6;
    hackWeight = 0.4;
  } else if (!weakenEnabled && !growEnabled && hackEnabled) {
    hackWeight = Weight.Full;
  } else if (weakenEnabled && growEnabled && hackEnabled) {
    weakenWeight = Weight.Weaken;
    growWeight = Weight.Grow;
    hackWeight = Weight.Hack;
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
    secondaryGrowRunning = ns.isRunning(secondaryGrowPID, hostname);
    tertiaryGrowRunning = ns.isRunning(tertiaryGrowPID, hostname);

    weakenThreads = Math.max(
      Math.floor((ramFree * weakenWeight) / weakenCost),
      1
    );
    growThreads = Math.max(Math.floor((ramFree * growWeight) / growCost), 1);
    hackThreads = Math.max(Math.floor((ramFree * hackWeight) / hackCost), 1);
    secondaryGrowThreads = Math.max(
      Math.floor((ramFree * hackWeight) / growCost),
      1
    );
    tertiaryGrowThreads = Math.max(
      Math.floor((ramFree * weakenWeight) / growCost),
      1
    );

    if (weakenEnabled && !weakenRunning && !tertiaryGrowRunning) {
      weakenPID = ns.run(weakenPath, weakenThreads, target, minWeakenPad);
      ns.toast(`${hostname} WEAKEN (${weakenThreads} threads)`, "success");

      // wait a second, see if it's running, and if not start a grow to help out at hack stop + 5%
      await ns.sleep(1000);

      if (!ns.isRunning(weakenPID)) {
        tertiaryGrowPID = ns.run(
          growPath,
          tertiaryGrowThreads,
          target,
          hackThresholdPercent + 5
        );

        ns.toast(
          `${hostname} TERTIARY GROW (${tertiaryGrowThreads} threads)`,
          "success"
        );
      }
    }

    if (growEnabled && !growRunning) {
      growPID = ns.run(growPath, growThreads, target, growThresholdPercent);
      ns.toast(`${hostname} GROW (${growThreads} threads)`, "success");
    }

    if (hackEnabled && !hackRunning && !secondaryGrowRunning) {
      hackPID = ns.run(hackPath, hackThreads, target, hackThresholdPercent);
      ns.toast(`${hostname} HACK (${hackThreads} threads)`, "success");

      // wait a second, see if it's running, and if not start a grow to help out at hack stop + 10%
      await ns.sleep(1000);

      if (!ns.isRunning(hackPID)) {
        secondaryGrowPID = ns.run(
          growPath,
          secondaryGrowThreads,
          target,
          hackThresholdPercent + 10
        );

        ns.toast(
          `${hostname} SECONDARY GROW (${secondaryGrowThreads} threads)`,
          "success"
        );
      }
    }

    await ns.sleep(60000);
  }
}
