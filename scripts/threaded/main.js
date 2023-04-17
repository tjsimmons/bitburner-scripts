import Weight from "/scripts/lib/Weights";

/*
 * The last 3 parameters, if set to -1, will disable that individual script
 */

/** @param {import("../..").NS} ns */
export async function main(ns) {
  const target = ns.args[0];
  let minWeakenPad = ns.args[1];
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

  let secondaryWeakenRunning = false;
  let secondaryWeakenPID = 0;
  let secondaryWeakenThreads = 0;

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

  // for secondary grow
  // let's set to to +5
  if (!weakenEnabled) {
    minWeakenPad = 5;
  }

  const targetMinSecurityDesired =
    ns.getServerMinSecurityLevel(target) + minWeakenPad;

  const targetMaxMoney = ns.getServerMaxMoney(target);
  let targetPercent = 0;

  const times = [
    ns.getHackTime(target),
    ns.getGrowTime(target),
    ns.getWeakenTime(target),
  ];

  // loop here
  while (true) {
    const mainSleepDelay = Math.round(Math.min(...times) / 3);
    const hostMaxRam = ns.getServerMaxRam(hostname);
    let ramFree = hostMaxRam - ns.getServerUsedRam(hostname);
    const targetSecurityLevel = ns.getServerSecurityLevel(target);
    const targetCurrentMoney = ns.getServerMoneyAvailable(target);
    weakenRunning = ns.isRunning(weakenPID, hostname);
    growRunning = ns.isRunning(growPID, hostname);
    hackRunning = ns.isRunning(hackPID, hostname);
    secondaryGrowRunning = ns.isRunning(secondaryGrowPID, hostname);
    tertiaryGrowRunning = ns.isRunning(tertiaryGrowPID, hostname);
    secondaryWeakenRunning = ns.isRunning(secondaryWeakenPID, hostname);
    secondaryWeakenThreads = Math.max(Math.floor(ramFree / weakenCost), 1);

    //ns.tprint(`DELAY ${mainSleepDelay / 1000}s`);

    if (weakenEnabled && !weakenRunning && !tertiaryGrowRunning) {
      weakenThreads = Math.max(
        Math.floor((ramFree * weakenWeight) / weakenCost),
        1
      );

      weakenPID = ns.run(weakenPath, weakenThreads, target, minWeakenPad);
      ns.toast(`${hostname} WEAKEN (${weakenThreads} threads)`, "success");

      // wait a second, see if it's running, and if not start a grow to help out at current money + 0%
      await ns.sleep(1000);

      if (!ns.isRunning(weakenPID)) {
        targetPercent =
          Math.round(
            (ns.getServerMoneyAvailable(target) / targetMaxMoney) * 100
          ) + 0;

        tertiaryGrowThreads = Math.max(Math.floor(ramFree / growCost), 1);

        tertiaryGrowPID = ns.run(
          growPath,
          tertiaryGrowThreads,
          target,
          targetPercent
        );

        ns.toast(
          `${hostname} TERTIARY GROW ${targetPercent}% (${tertiaryGrowThreads} threads)`,
          "success"
        );
      } else if (
        !ns.isRunning(weakenPID) &&
        ns.isRunning(tertiaryGrowPID) &&
        targetSecuritylevel >= targetMinSecurityDesired
      ) {
        ns.toast(`${hostname} KILLING GROW`);
        ns.kill(tertiaryGrowPID);
      }
    } else if (weakenEnabled) {
      /*ns.toast(
        `${hostname} ${
          weakenRunning ? "WEAKEN" : tertiaryGrowRunning ? "TERTIARY GROW" : ""
        } still executing`,
        "info",
        5000
      );*/
    }

    // skip grow and hack if security is too high - they'll take ages
    // use them to weaken instead
    if (
      targetSecurityLevel >= targetMinSecurityDesired &&
      !secondaryWeakenRunning &&
      !weakenEnabled &&
      !(secondaryGrowRunning || hackRunning || weakenRunning)
    ) {
      secondaryWeakenPID = ns.run(
        weakenPath,
        secondaryWeakenThreads,
        target,
        minWeakenPad
      );

      ns.toast(
        `${hostname} SECONDARY WEAKEN (${secondaryWeakenThreads} threads)`,
        "success"
      );
    } else if (
      targetSecurityLevel > targetMinSecurityDesired &&
      secondaryWeakenRunning
    ) {
      //ns.toast(`${hostname} SECONDARY WEAKEN still executing`, "info", 5000);
    } else {
      if (secondaryWeakenRunning) {
        ns.kill(secondaryWeakenPID);
      }

      secondaryWeakenPID = 0;

      hostMaxRam - ns.getServerUsedRam(hostname);
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

      if (growEnabled && !growRunning) {
        growPID = ns.run(growPath, growThreads, target, growThresholdPercent);
        ns.toast(`${hostname} GROW (${growThreads} threads)`, "success");
      } else if (growEnabled) {
        //ns.toast(`${hostname} GROW still executing`, "info", 5000);
      }

      if (hackEnabled && !hackRunning && !secondaryGrowRunning) {
        hackPID = ns.run(hackPath, hackThreads, target, hackThresholdPercent);
        ns.toast(`${hostname} HACK (${hackThreads} threads)`, "success");

        // wait a second, see if it's running, and if not start a grow to help out at current money + 5%
        await ns.sleep(1000);

        if (
          !ns.isRunning(hackPID) &&
          ns.getServerMoneyAvailable(target) < targetMaxMoney
        ) {
          targetPercent = 1;

          secondaryGrowPID = ns.run(
            growPath,
            secondaryGrowThreads,
            target,
            targetPercent
          );

          /*ns.toast(
            `${hostname} SECONDARY GROW ${targetPercent}% (${secondaryGrowThreads} threads)`,
            "success"
          );*/
        } else if (
          !ns.isRunning(hackPID) &&
          ns.isRunning(secondaryGrowPID) &&
          targetCurrentMoney > targetCurrentMoney * targetPercent
        ) {
          ns.toast(`${hostname} KILLING GROW`);
          ns.kill(secondaryGrowPID);
        }
      } else if (
        hackRunning &&
        targetCurrentMoney <= targetMaxMoney * (targetPercent / 100)
      ) {
        ns.tprint(`${hostname} ${target} HACK KILL`);
        ns.kill(hackPID);
      } else if (hackEnabled) {
        /*ns.toast(
          `${hostname} ${
            hackRunning ? "HACK" : secondaryGrowRunning ? "SECONDARY GROW" : ""
          } still executing`,
          "info",
          5000
        );*/
      }
    }

    await ns.sleep(mainSleepDelay);
  }
}
