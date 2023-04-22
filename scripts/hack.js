/** @param {import("..").NS} ns */
export async function main(ns) {
  const target = ns.args[0];
  const hackThresholdPercent = ns.args[1];
  const growThresholdPercent = ns.args[2];
  const hostname = ns.getHostname();

  if (target === undefined) {
    ns.toast("Target must be passed as an argument", "error", 3000);
    return;
  }

  if (hackThresholdPercent === undefined) {
    ns.toast(
      "hackThresholdPercent must be passed as an argument",
      "error",
      3000
    );
    return;
  }

  let moneyAvailable = ns.getServerMoneyAvailable(target);
  const hackThreshold =
    ns.getServerMaxMoney(target) * (hackThresholdPercent / 100);
  const growThreshold =
    ns.getServerMaxMoney(target) * (growThresholdPercent / 100);
  let hackDidRun = false;

  if (moneyAvailable >= growThreshold) {
    while (moneyAvailable >= hackThreshold) {
      const hackTimeSecs = Math.round(ns.getHackTime(target) / 1000);

      ns.tprint(
        `${hostname} HACK ${target} ${moneyAvailable.toFixed(
          3
        )} / ${hackThreshold.toFixed(3)} (${hackTimeSecs}s)`
      );

      await ns.hack(target);

      moneyAvailable = ns.getServerMoneyAvailable(target);

      if (!hackDidRun) {
        hackDidRun = true;
      }
    }

    if (hackDidRun) {
      ns.toast(
        `${target} drained to ${hackThreshold.toFixed(3)}`,
        "success",
        10000
      );
    } else {
      /*ns.toast(
      `${hostname} did not run hack against ${target} ${moneyAvailable.toFixed(
        3
      )} / ${hackThreshold.toFixed(3)}`,
      "error",
      5000
    );*/
    }
  }
}
