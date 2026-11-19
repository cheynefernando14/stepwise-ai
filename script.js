function calculateEnergy() {
    const steps = Number(document.getElementById("steps").value);
    const energyPerStep = Number(document.getElementById("energyPerStep").value);

    if (steps < 0 || energyPerStep < 0 ||
        !Number.isFinite(steps) || !Number.isFinite(energyPerStep)) {
        alert("Please enter valid positive numbers.");
        return;
    }

    // Convert millijoules to watt-hours
    const generatedEnergy = (steps * energyPerStep) / 3600000;

    // Illustrative 70% usable energy assumption
    const usableEnergy = generatedEnergy * 0.70;

    document.getElementById("energyResult").innerHTML =
        `Generated: ${generatedEnergy.toFixed(5)} Wh/day<br>
         Usable after losses: ${usableEnergy.toFixed(5)} Wh/day`;
}
