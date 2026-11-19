// =====================================
// STEPWISE AI - SYSTEM CONFIGURATION
// =====================================

const ENERGY_PER_STEP = 0.005; // Joules
const EFFICIENCY = 0.70;
const STORAGE_CAPACITY = 0.02; // Wh

const SENSOR_ENERGY = 0.00035;
const TRANSMISSION_ENERGY = 0.00015;

const BIN_HEIGHT = 100;

// =====================================
// SYSTEM DATA
// =====================================

let totalSteps = 0;
let totalEnergy = 0;
let storedEnergy = 0;
let energyConsumed = 0;
let energyOverflow = 0;

let bins = [
    { name: "Bin 01", location: "Main Entrance", fill: 32, rate: 9 },
    { name: "Bin 02", location: "Library", fill: 68, rate: 6 },
    { name: "Bin 03", location: "Cafeteria", fill: 88, rate: 18 },
    { name: "Bin 04", location: "Lecture Hall", fill: 48, rate: 8 }
];

let locations = [
    { name: "Main Entrance", steps: 22000, demand: 85, cost: 5000 },
    { name: "Library", steps: 14000, demand: 65, cost: 3200 },
    { name: "Cafeteria", steps: 19000, demand: 95, cost: 4200 },
    { name: "Lecture Hall", steps: 9000, demand: 45, cost: 2500 }
];

// =====================================
// HELPER FUNCTIONS
// =====================================

function formatEnergy(value) {
    return value.toFixed(6);
}

function getBinStatus(fill) {

    if (fill >= 100) return "Immediate Collection";
    if (fill >= 85) return "High Priority";
    if (fill >= 75) return "Plan Collection";
    if (fill >= 60) return "Monitor";

    return "Normal";
}

// =====================================
// 1. KINETIC FLOORING
// =====================================

function generateEnergy() {

    let steps = Number(document.getElementById("stepInput").value);

    if (!Number.isFinite(steps) || steps <= 0) {
        alert("Enter a valid number of footsteps.");
        return;
    }

    steps = Math.floor(Math.min(steps, 1000000));

    let generatedJoules = steps * ENERGY_PER_STEP;

    let generatedWh = (generatedJoules / 3600) * EFFICIENCY;

    totalSteps += steps;
    totalEnergy += generatedWh;

    let availableSpace = STORAGE_CAPACITY - storedEnergy;

    let energyStored = Math.min(generatedWh, availableSpace);

    storedEnergy += energyStored;

    energyOverflow += generatedWh - energyStored;

    updateDashboard();
    runAnalysis();
}

// =====================================
// 2. ENERGY CONSUMPTION
// =====================================

function transmitData() {

    let requiredEnergy = SENSOR_ENERGY + TRANSMISSION_ENERGY;

    if (storedEnergy < requiredEnergy) {

        document.getElementById("transmissionStatus").textContent =
            "Transmission failed: insufficient stored energy.";

        alert("Not enough stored energy. Simulate more footsteps.");

        return;
    }

    storedEnergy -= requiredEnergy;
    energyConsumed += requiredEnergy;

    let index = Number(document.getElementById("binSelect").value);

    let distance = BIN_HEIGHT * (1 - bins[index].fill / 100);

    document.getElementById("sensorDistance").textContent =
        distance.toFixed(1) + " cm";

    document.getElementById("transmissionStatus").textContent =
        bins[index].name + " data successfully transmitted (simulated).";

    document.getElementById("wirelessStatus").textContent =
        "TRANSMITTED";

    updateDashboard();
    runAnalysis();
}

// =====================================
// 3. SMART BIN MONITORING
// =====================================

function addWaste() {

    let index = Number(document.getElementById("binSelect").value);

    let amount = Number(document.getElementById("wasteInput").value);

    if (!Number.isFinite(amount) || amount <= 0) {
        alert("Enter a valid waste amount.");
        return;
    }

    amount = Math.min(amount, 100);

    bins[index].fill = Math.min(100, bins[index].fill + amount);

    updateDashboard();
    runAnalysis();
}

function emptyBin() {

    let index = Number(document.getElementById("binSelect").value);

    bins[index].fill = 0;

    updateDashboard();
    runAnalysis();
}

function displayBins() {

    let container = document.getElementById("binContainer");

    container.innerHTML = "";

    bins.forEach((bin, index) => {

        let status = getBinStatus(bin.fill);

        let color = "success";

        if (bin.fill >= 85) {
            color = "danger";
        } else if (bin.fill >= 60) {
            color = "warning";
        }

        container.innerHTML += `
            <div class="col-sm-6">
                <div class="bin-card">

                    <h6>${bin.name}</h6>

                    <small>${bin.location}</small>

                    <h3>${bin.fill}%</h3>

                    <div class="progress">
                        <div class="progress-bar bg-${color}"
                             style="width:${bin.fill}%">
                        </div>
                    </div>

                    <p class="mt-2 mb-0 small">
                        ${status}
                    </p>

                </div>
            </div>
        `;
    });
}

// =====================================
// 4. DASHBOARD UPDATES
// =====================================

function updateDashboard() {

    document.getElementById("totalSteps").textContent =
        totalSteps.toLocaleString();

    document.getElementById("totalEnergy").textContent =
        formatEnergy(totalEnergy);

    document.getElementById("storedEnergy").textContent =
        formatEnergy(storedEnergy);

    document.getElementById("energyConsumed").textContent =
        formatEnergy(energyConsumed) + " Wh";

    document.getElementById("energyOverflow").textContent =
        formatEnergy(energyOverflow) + " Wh";

    let percentage = (storedEnergy / STORAGE_CAPACITY) * 100;

    document.getElementById("storagePercentage").textContent =
        percentage.toFixed(1) + "%";

    document.getElementById("storageProgress").style.width =
        percentage + "%";

    document.getElementById("energyProgress").style.width =
        Math.min(100, totalEnergy / STORAGE_CAPACITY * 100) + "%";

    document.getElementById("powerStatus").textContent =
        storedEnergy >= SENSOR_ENERGY + TRANSMISSION_ENERGY
        ? "Ready for operation"
        : "Insufficient energy";

    document.getElementById("attentionBins").textContent =
        bins.filter(bin => bin.fill >= 75).length;

    document.getElementById("floorStatus").textContent =
        totalSteps > 0 ? "DATA RECEIVED" : "SIMULATED";

    document.getElementById("storageStatus").textContent =
        storedEnergy > 0 ? "CHARGED" : "WAITING";

    displayBins();

    updateCollectionPlan();
}

// =====================================
// 5. AI-BASED ANALYSIS
// =====================================

function runAnalysis() {

    analyzeEnergy();
    optimizeFlooring();
    optimizeSystem();

    updateCollectionPlan();
}

// ENERGY ANALYSIS

function analyzeEnergy() {

    let requiredEnergy = SENSOR_ENERGY + TRANSMISSION_ENERGY;

    let title = document.getElementById("energyAnalysis");
    let recommendation = document.getElementById("energyRecommendation");

    if (storedEnergy >= requiredEnergy) {

        title.textContent = "Energy Available";

        recommendation.textContent =
            "Stored energy can support at least one simulated sensor reading and wireless transmission.";

    } else {

        title.textContent = "Insufficient Energy";

        recommendation.textContent =
            "Generate additional energy through the kinetic flooring before operating the sensor and transmitter.";
    }
}

// FLOORING LOCATION OPTIMIZATION

function optimizeFlooring() {

    let results = [];

    locations.forEach(location => {

        let trafficScore = location.steps / 22000;

        let demandScore = location.demand / 100;

        let costScore = 1 - (location.cost - 2500) / 2500;

        let score = (
            trafficScore * 0.45 +
            demandScore * 0.35 +
            costScore * 0.20
        ) * 100;

        results.push({
            ...location,
            score: score
        });
    });

    results.sort((a, b) => b.score - a.score);

    let table = document.getElementById("locationResults");

    table.innerHTML = "";

    results.forEach((location, index) => {

        let recommendation =
            index === 0 ? "Best Candidate" :
            location.score >= 60 ? "Consider" : "Lower Priority";

        table.innerHTML += `
            <tr>
                <td>${location.name}</td>
                <td>${location.steps.toLocaleString()}</td>
                <td>${location.demand}%</td>
                <td>AED ${location.cost.toLocaleString()}</td>
                <td>${location.score.toFixed(1)}/100</td>
                <td>${recommendation}</td>
            </tr>
        `;
    });

    document.getElementById("floorAnalysis").textContent =
        results[0].name;

    document.getElementById("floorRecommendation").textContent =
        "This location has the highest suitability score based on pedestrian activity, nearby bin demand, and installation cost.";
}

// SYSTEM OPTIMIZATION

function optimizeSystem() {

    let highPriorityBins = bins.filter(bin => bin.fill >= 85).length;

    let plannedBins = bins.filter(bin =>
        bin.fill >= 75 && bin.fill < 85
    ).length;

    let title = document.getElementById("systemAnalysis");
    let recommendation = document.getElementById("systemRecommendation");

    if (highPriorityBins > 0) {

        title.textContent = highPriorityBins + " Bins Need Collection";

        recommendation.textContent =
            "Prioritize bins with fill levels of 85% or higher.";

    } else if (plannedBins > 0) {

        title.textContent = "Collection Planning Needed";

        recommendation.textContent =
            "Schedule the bins reaching 75–84% for the next collection round.";

    } else {

        title.textContent = "System Operating Normally";

        recommendation.textContent =
            "Continue monitoring energy availability and smart-bin fill levels.";
    }
}

// =====================================
// 6. WASTE COLLECTION PLANNER
// =====================================

function updateCollectionPlan() {

    let table = document.getElementById("collectionResults");

    if (!table) return;

    let sortedBins = bins.map(bin => {

        let timeUntilFull = bin.fill >= 100
            ? 0
            : ((100 - bin.fill) / bin.rate) * 24;

        return {
            ...bin,
            timeUntilFull: timeUntilFull
        };

    });

    sortedBins.sort((a, b) => {

        let priorityA = a.fill >= 85 ? 1 :
                        a.fill >= 75 ? 2 :
                        a.fill >= 60 ? 3 : 4;

        let priorityB = b.fill >= 85 ? 1 :
                        b.fill >= 75 ? 2 :
                        b.fill >= 60 ? 3 : 4;

        return priorityA - priorityB ||
               a.timeUntilFull - b.timeUntilFull;
    });

    table.innerHTML = "";

    sortedBins.forEach(bin => {

        let priority;
        let action;
        let priorityClass;

        if (bin.fill >= 100) {

            priority = "Immediate";
            action = "Collect immediately";
            priorityClass = "priority-high";

        } else if (bin.fill >= 85) {

            priority = "High";
            action = "Prioritize collection";
            priorityClass = "priority-high";

        } else if (bin.fill >= 75) {

            priority = "Planned";
            action = "Include in next collection";
            priorityClass = "priority-medium";

        } else if (bin.fill >= 60) {

            priority = "Monitor";
            action = "Continue monitoring";
            priorityClass = "priority-medium";

        } else {

            priority = "Normal";
            action = "No collection required";
            priorityClass = "priority-low";
        }

        let timeText = bin.fill >= 100
            ? "Already full"
            : bin.timeUntilFull.toFixed(1) + " hours";

        table.innerHTML += `
            <tr>
                <td class="${priorityClass}">${priority}</td>
                <td>${bin.name}</td>
                <td>${bin.fill}%</td>
                <td>${timeText}</td>
                <td>${action}</td>
            </tr>
        `;
    });
}

// =====================================
// INITIALIZE WEBSITE
// =====================================

updateDashboard();
runAnalysis();
