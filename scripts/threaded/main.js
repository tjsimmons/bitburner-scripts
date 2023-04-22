import Weight from "/scripts/lib/Weights";

/*
 * The last 3 parameters, if set to -1, will disable that individual script
 */

/** @param {import("../..").NS} ns */
export async function main(ns) {
  const target = ns.args[0];
  let minWeakenPad = ns.args[1];
  let growThresholdPercent = ns.args[2];
  const hackThresholdPercent = ns.args[3];
  const hostname = ns.getHostname();
  const secondaryGrowEnabled = true;
  const secondaryWeakenEnabled = true;

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
  if (!growEnabled) {
    growThresholdPercent = 100;
  }

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
  const targetGrowMoney = targetMaxMoney * (growThresholdPercent / 100);
  const targetHackMoney = targetMaxMoney * (hackThresholdPercent / 100);

  const times = [
    ns.getHackTime(target),
    ns.getGrowTime(target),
    ns.getWeakenTime(target),
  ];

  const mainSleepDelay = 100;

  // loop here
  while (true) {
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

    //ns.print(`DELAY ${mainSleepDelay / 1000}s`);

    if (weakenRunning && targetSecurityLevel <= targetMinSecurityDesired) {
      ns.tprint(`${hostname} ${target} WEAKEN KILL`);
      ns.kill(weakenPID);
    }

    if (
      secondaryWeakenRunning &&
      targetSecurityLevel <= targetMinSecurityDesired
    ) {
      ns.tprint(`${hostname} ${target} SECONDARY WEAKEN KILL`);
      ns.kill(secondaryWeakenPID);
    }

    if (hackRunning && targetCurrentMoney <= targetHackMoney) {
      ns.tprint(`${hostname} ${target} HACK KILL`);
      ns.kill(hackPID);
    }

    if (growRunning && targetCurrentMoney >= targetGrowMoney) {
      ns.tprint(`${hostname} ${target} GROW KILL`);
      ns.kill(growPID);
    }

    if (
      secondaryGrowRunning &&
      (targetCurrentMoney >= targetGrowMoney ||
        targetCurrentMoney >= targetHackMoney)
    ) {
      ns.tprint(`${hostname} ${target} SECONDARY GROW KILL`);
      ns.kill(secondaryGrowPID);
    }

    if (
      tertiaryGrowRunning &&
      (targetCurrentMoney >= targetGrowMoney ||
        targetSecurityLevel > targetMinSecurityDesired)
    ) {
      ns.tprint(`${hostname} ${target} TERTIARY GROW KILL`);
      ns.kill(tertiaryGrowPID);
    }

    if (
      !weakenRunning &&
      !growRunning &&
      !hackRunning &&
      !secondaryWeakenRunning &&
      !secondaryGrowRunning &&
      !tertiaryGrowRunning
    ) {
      if (weakenEnabled && !weakenRunning && !tertiaryGrowRunning) {
        weakenThreads = Math.max(
          Math.floor((ramFree * weakenWeight) / weakenCost),
          1
        );

        weakenPID = ns.run(weakenPath, weakenThreads, target, minWeakenPad);
        //ns.toast(`${hostname} WEAKEN (${weakenThreads} threads)`, "success");

        // wait a second, see if it's running, and if not start a grow to help out at current money + 0%
        await ns.sleep(1000);

        if (!ns.isRunning(weakenPID)) {
          tertiaryGrowThreads = Math.max(Math.floor(ramFree / growCost), 1);

          tertiaryGrowPID = ns.run(
            growPath,
            tertiaryGrowThreads,
            target,
            growThresholdPercent
          );

          /*//ns.toast(
            `${hostname} TERTIARY GROW ${growThresholdPercent}% (${tertiaryGrowThreads} threads)`,
            "success"
          );*/
        } else if (
          !ns.isRunning(weakenPID) &&
          ns.isRunning(tertiaryGrowPID) &&
          targetSecuritylevel >= targetMinSecurityDesired
        ) {
          //ns.toast(`${hostname} KILLING GROW`);
          ns.kill(tertiaryGrowPID);
        }
      } else if (weakenEnabled) {
        /*//ns.toast(
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
        secondaryWeakenEnabled &&
        targetSecurityLevel >= targetMinSecurityDesired &&
        !secondaryWeakenRunning &&
        !weakenEnabled &&
        !(secondaryGrowRunning || hackRunning || weakenRunning)
      ) {
        if (secondaryWeakenThreads > 1) {
          secondaryWeakenPID = ns.run(
            weakenPath,
            secondaryWeakenThreads,
            target,
            minWeakenPad
          );

          /*//ns.toast(
            `${hostname} SECONDARY WEAKEN (${secondaryWeakenThreads} threads)`,
            "success"
          );*/
        }
      } else if (
        targetSecurityLevel > targetMinSecurityDesired &&
        secondaryWeakenRunning
      ) {
        ////ns.toast(`${hostname} SECONDARY WEAKEN still executing`, "info", 5000);
      } else {
        if (secondaryWeakenRunning) {
          ns.kill(secondaryWeakenPID);
        }

        secondaryWeakenPID = 0;

        hostMaxRam - ns.getServerUsedRam(hostname);
        growThreads = Math.max(
          Math.floor((ramFree * growWeight) / growCost),
          1
        );
        hackThreads = Math.max(
          Math.floor((ramFree * hackWeight) / hackCost),
          1
        );
        secondaryGrowThreads = Math.max(Math.floor(ramFree / growCost), 1);
        tertiaryGrowThreads = Math.max(Math.floor(ramFree / growCost), 1);

        if (growEnabled && !growRunning) {
          growPID = ns.run(growPath, growThreads, target, growThresholdPercent);
          //ns.toast(`${hostname} GROW (${growThreads} threads)`, "success");
        } else if (growEnabled) {
          ////ns.toast(`${hostname} GROW still executing`, "info", 5000);
        }

        if (hackEnabled && !hackRunning && !secondaryGrowRunning) {
          hackPID = ns.run(
            hackPath,
            hackThreads,
            target,
            hackThresholdPercent,
            growThresholdPercent
          );
          //ns.toast(`${hostname} HACK (${hackThreads} threads)`, "success");

          // wait a second, see if it's running, and if not start a grow to help out at current money + 5%
          await ns.sleep(1000);

          if (
            secondaryGrowEnabled &&
            !ns.isRunning(hackPID) &&
            ns.getServerMoneyAvailable(target) < targetGrowMoney
          ) {
            secondaryGrowPID = ns.run(
              growPath,
              secondaryGrowThreads,
              target,
              growThresholdPercent
            );

            /*//ns.toast(
              `${hostname} SECONDARY GROW ${growThresholdPercent}% (${secondaryGrowThreads} threads)`,
              "success"
            );*/
          }
        } else if (hackEnabled) {
          /*//ns.toast(
          `${hostname} ${
            hackRunning ? "HACK" : secondaryGrowRunning ? "SECONDARY GROW" : ""
          } still executing`,
          "info",
          5000
        );*/
        }
      }
    }

    await ns.sleep(mainSleepDelay);
  }
}
