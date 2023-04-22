/** @param {import("..").NS} ns */
export async function main(ns) {
  const target = ns.args[0];
  const thresholdPercent = ns.args[1];
  const hostname = ns.getHostname();

  if (target === undefined) {
    ns.toast("Target must be passed as an argument", "error", 3000);
    return;
  }

  if (thresholdPercent === undefined) {
    ns.toast("thresholdPercent must be passed as an argument", "error", 3000);
    return;
  }

  const maxMoney = ns.getServerMaxMoney(target);
  let currentMoney = ns.getServerMoneyAvailable(target);
  let pastThreshold = isPastThreshold(currentMoney, maxMoney, thresholdPercent);
  let growDidRun = false;

  do {
    const growTimeSecs = Math.round(ns.getGrowTime(target) / 1000);

    ns.tprint(
      `${hostname} GROW ${target} ${currentMoney.toFixed(3)} / ${(
        maxMoney *
        (thresholdPercent / 100)
      ).toFixed(3)} (${growTimeSecs}s)`
    );

    await ns.grow(target);

    currentMoney = ns.getServerMoneyAvailable(target);
    pastThreshold = isPastThreshold(currentMoney, maxMoney, thresholdPercent);

    if (!growDidRun) {
      growDidRun = true;
    }
  } while (!pastThreshold);

  if (growDidRun) {
    ns.toast(`${target} grown to ${currentMoney.toFixed(3)}`, "success", 10000);
  } else {
    /*ns.toast(
      `${hostname} did not run grow against ${target} ${currentMoney.toFixed(
        3
      )} / ${(maxMoney * (thresholdPercent / 100)).toFixed(3)}`,
      "error",
      5000
    );*/
  }
}

const isPastThreshold = (current, max, threshold) =>
  current >= max * (threshold / 100);
