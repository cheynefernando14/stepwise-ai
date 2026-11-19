// =====================================
// STEPWISE AI - SIMULATION VARIABLES
// =====================================

// Flooring variables
let totalSteps = 0;
let totalEnergy = 0;

// Energy storage variables
let storedEnergy = 0;
let energyUsed = 0;

// Smart bin variables
let binFill = 0;
let packetCount = 0;

// Energy conversion efficiency
const efficiency = 0.70;

// Smart bin settings
const binHeight = 100;

// Energy needed for one measurement and transmission
const sensorEnergy = 0.000001;
const transmissionEnergy = 0.000001;


// =====================================
// SMART FLOORING SIMULATION
// =====================================

function simulateFootsteps(numberOfSteps) {

    // Get the number of steps from the input
    if (numberOfSteps === undefined) {
        numberOfSteps = Number(
            document.getElementById("stepInput").value
        );
    }

    // Check if the input is valid
    if (!Number.isFinite(numberOfSteps) ||
        numberOfSteps <= 0 ||
        !Number.isInteger(numberOfSteps)) {

        alert("Please enter a valid positive whole number of footsteps.");
        return;
    }

    // Get energy produced by each step in millijoules
    let energyPerStep = Number(
        document.getElementById("energyInput").value
    );

    if (!Number.isFinite(energyPerStep) || energyPerStep <= 0) {
        alert("Please enter a valid energy value.");
        return;
    }

    // Calculate the total energy generated
    // 1 Wh = 3,600,000 mJ

    let generatedEnergy =
        (numberOfSteps * energyPerStep) / 3600000;

    // Calculate usable energy after conversion losses
    let usableEnergy = generatedEnergy * efficiency;

    // Update the system values
    totalSteps += numberOfSteps;
    totalEnergy += generatedEnergy;

    // Add energy to the storage unit
    storedEnergy += usableEnergy;

    // Get storage capacity
    let capacity = getStorageCapacity();

    // Prevent storage from exceeding its capacity
    if (storedEnergy > capacity) {
        storedEnergy = capacity;
    }

    // Display the latest generated energy
    document.getElementById("latestEnergy").textContent =
        generatedEnergy.toFixed(8) + " Wh";

    updateDashboard();
}


// =====================================
// STORAGE CAPACITY
// =====================================

function getStorageCapacity() {

    let capacity = Number(
        document.getElementById("capacityInput").value
    );

    if (!Number.isFinite(capacity) || capacity <= 0) {
        return 0.01;
    }

    return capacity;
}


// =====================================
// SMART BIN SIMULATION
// =====================================

function addWaste() {

    // Increase the bin fill level by 10%
    binFill += 10;

    // The bin cannot exceed 100%
    if (binFill > 100) {
        binFill = 100;
    }

    updateDashboard();
}


function emptyBin() {

    // Reset the bin fill level
    binFill = 0;

    updateDashboard();
}


// =====================================
// ULTRASONIC SENSOR AND LORA
// =====================================

function measureBin() {

    // Calculate the energy required
    let requiredEnergy = sensorEnergy + transmissionEnergy;

    // Check whether enough energy is stored
    if (storedEnergy < requiredEnergy) {

        document.getElementById("transmissionStatus").textContent =
            "Failed - Insufficient Energy";

        document.getElementById("sensorStatus").textContent =
            "Measurement not completed";

        document.getElementById("energyAlert").className =
            "alert alert-warning";

        document.getElementById("energyAlert").textContent =
            "Not enough stored energy to complete the sensor measurement and transmission.";

        updateDashboard();
        return;
    }

    // Use energy for the sensor and transmission
    storedEnergy -= requiredEnergy;
    energyUsed += requiredEnergy;

    // Record a successful transmission
    packetCount++;

    document.getElementById("transmissionStatus").textContent =
        "Successful";

    document.getElementById("sensorStatus").textContent =
        "Measurement completed";

    updateDashboard();
}


// =====================================
// DASHBOARD UPDATES
// =====================================

function updateDashboard() {

    // Get storage capacity
    let capacity = getStorageCapacity();

    // Calculate storage percentage
    let storagePercentage = 0;

    if (capacity > 0) {
        storagePercentage = (storedEnergy / capacity) * 100;
    }

    // Calculate ultrasonic sensor distance
    // A fuller bin means a shorter distance

    let sensorDistance =
        binHeight * (1 - binFill / 100);

    // Update main statistics
    document.getElementById("totalSteps").textContent =
        totalSteps.toLocaleString();

    document.getElementById("energyGenerated").textContent =
        totalEnergy.toFixed(8);

    document.getElementById("storedEnergy").textContent =
        storedEnergy.toFixed(8);

    document.getElementById("binPercentage").textContent =
        binFill + "%";


    // Update storage monitor
    document.getElementById("storagePercentage").textContent =
        storagePercentage.toFixed(1);

    document.getElementById("storageDetails").textContent =
        storedEnergy.toFixed(8) + " Wh";

    document.getElementById("energyUsed").textContent =
        energyUsed.toFixed(8) + " Wh";

    document.getElementById("storageBar").style.width =
        Math.min(storagePercentage, 100) + "%";


    // Update bin monitor
    document.getElementById("binLevelText").textContent =
        binFill + "%";

    document.getElementById("binBar").style.width =
        binFill + "%";

    document.getElementById("sensorDistance").textContent =
        sensorDistance.toFixed(1) + " cm";


    // Change the bin progress bar color
    let binBar = document.getElementById("binBar");

    if (binFill >= 80) {
        binBar.className = "progress-bar bg-danger";
    } else if (binFill >= 50) {
        binBar.className = "progress-bar bg-warning";
    } else {
        binBar.className = "progress-bar bg-success";
    }


    // Update connectivity information
    document.getElementById("packetCount").textContent =
        packetCount;

    // Update bin collection alert
    updateBinAlert();

    // Update energy alert
    updateEnergyAlert();

    // Update the system summary
    updateSystemSummary();

    // Update time
    updateTime();
}


// =====================================
// BIN COLLECTION ALERTS
// =====================================

function updateBinAlert() {

    let alertBox = document.getElementById("collectionAlert");
    let binText = document.getElementById("binAlert");

    if (binFill >= 100) {

        binText.textContent = "Bin is full!";
        alertBox.className = "alert alert-danger";
        alertBox.textContent =
            "Collection required. The bin has reached 100% capacity.";

    } else if (binFill >= 80) {

        binText.textContent = "Collection recommended.";
        alertBox.className = "alert alert-warning";
        alertBox.textContent =
            "The bin has reached at least 80% capacity. Schedule collection soon.";

    } else {

        binText.textContent = "Bin is not full.";
        alertBox.className = "alert alert-success";
        alertBox.textContent =
            "The bin has enough remaining space. Collection is not urgent.";
    }
}


// =====================================
// ENERGY ALERTS
// =====================================

function updateEnergyAlert() {

    let alertBox = document.getElementById("energyAlert");

    let capacity = getStorageCapacity();

    let storagePercentage = 0;

    if (capacity > 0) {
        storagePercentage = (storedEnergy / capacity) * 100;
    }

    if (storedEnergy <= 0) {

        alertBox.className = "alert alert-warning";
        alertBox.textContent =
            "No energy is currently stored. Simulate footsteps to generate energy.";

    } else if (storagePercentage >= 90) {

        alertBox.className = "alert alert-success";
        alertBox.textContent =
            "Energy storage is nearly full. The system has a high stored energy level.";

    } else {

        alertBox.className = "alert alert-info";
        alertBox.textContent =
            "Energy is available in the storage unit. Continue monitoring energy generation and consumption.";
    }
}


// =====================================
// SYSTEM SUMMARY
// =====================================

function updateSystemSummary() {

    let summary = document.getElementById("systemSummary");

    summary.textContent =
        "The flooring has recorded " +
        totalSteps.toLocaleString() +
        " footsteps. Total generated energy is " +
        totalEnergy.toFixed(8) +
        " Wh. The storage unit currently contains " +
        storedEnergy.toFixed(8) +
        " Wh. The smart bin is " +
        binFill +
        "% full. A total of " +
        packetCount +
        " successful transmissions have been recorded.";
}


// =====================================
// TIME DISPLAY
// =====================================

function updateTime() {

    let currentTime = new Date();

    document.getElementById("lastUpdated").textContent =
        currentTime.toLocaleTimeString();
}


// =====================================
// RESET SIMULATION
// =====================================

function resetSimulation() {

    // Reset all simulation variables
    totalSteps = 0;
    totalEnergy = 0;
    storedEnergy = 0;
    energyUsed = 0;
    binFill = 0;
    packetCount = 0;

    // Reset input values
    document.getElementById("stepInput").value = 1000;
    document.getElementById("energyInput").value = 5;
    document.getElementById("capacityInput").value = 0.01;

    // Reset transmission information
    document.getElementById("transmissionStatus").textContent =
        "No transmission yet";

    document.getElementById("sensorStatus").textContent =
        "Waiting for measurement";

    document.getElementById("latestEnergy").textContent =
        "0 Wh";

    // Refresh the dashboard
    updateDashboard();
}


// =====================================
// START THE DASHBOARD
// =====================================

// Display initial values when the page loads
updateDashboard();
