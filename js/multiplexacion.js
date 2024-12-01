function showForm() {
    const selectedType = document.getElementById("multiplexType").value;
    document.getElementById("tdmForm").classList.add("hidden");
    document.getElementById("fdmForm").classList.add("hidden");

    if (selectedType === "tdm") {
        document.getElementById("tdmForm").classList.remove("hidden");
    } else if (selectedType === "fdm") {
        document.getElementById("fdmForm").classList.remove("hidden");
    }
}

// Función para calcular TDM
function calculateTDM() {
    // Obteniendo los valores del formulario
    const numChannels = parseInt(document.getElementById("tdmNumChannels").value);
    const sourceRate = parseInt(document.getElementById("tdmSourceRate").value);
    const interleaving = document.getElementById("tdmInterleaving").value;
    const syncType = document.getElementById("tdmSyncType").value;
    const bitsPerSource = parseInt(document.getElementById("tdmBitsPerSource").value);
    const syncBits = syncType === "bit" ? parseInt(document.getElementById("tdmSyncBits").value) : 8; // 8 bits si es byte

    // Validaciones para asegurarse de que los valores sean válidos
    if (isNaN(numChannels) || isNaN(sourceRate) || isNaN(bitsPerSource) || numChannels <= 0 || sourceRate <= 0 || bitsPerSource <= 0) {
        alert("Por favor ingresa valores válidos.");
        return;
    }

    // Cálculos
    const bitsPerFrame = numChannels * bitsPerSource + syncBits; // Bits por trama
    const frameDuration = bitsPerFrame / sourceRate; // Duración de la trama en segundos
    const transmissionRate = bitsPerFrame / frameDuration; // Tasa de transmisión

    // Bits eficientes (datos útiles sin incluir los bits de sincronización)
    const efficientBits = numChannels * bitsPerSource;

    // Eficiencia del sistema
    const efficiency = (efficientBits / bitsPerFrame) * 100; // En porcentaje

    // Mostrar resultados
    document.getElementById("tdmBitsPerFrame").innerText = bitsPerFrame.toFixed(2);
    document.getElementById("tdmFrameDuration").innerText = frameDuration.toFixed(6); // Usar 6 decimales para mayor precisión
    document.getElementById("tdmTransmissionRate").innerText = transmissionRate.toFixed(2);
    document.getElementById("tdmEfficientBits").innerText = efficientBits.toFixed(2);
    document.getElementById("tdmEfficiency").innerText = efficiency.toFixed(2) + " %";

    // Mostrar el bloque de resultados
    document.getElementById("tdmResult").classList.remove("hidden");
}


// Función para calcular FDM
function calculateFDM() {
    const channelBandwidth = parseFloat(document.getElementById("fdmChannelBandwidth").value);
    const numChannels = parseInt(document.getElementById("fdmNumChannels").value);
    const guardBandwidth = parseFloat(document.getElementById("fdmGuardBandwidth").value);

    const guardBandwidthKHz = guardBandwidth / 1000;
    const totalChannelBandwidth = numChannels * channelBandwidth;
    const totalGuardBandwidth = (numChannels - 1) * guardBandwidthKHz;
    const totalBandwidth = totalChannelBandwidth + totalGuardBandwidth;

    document.getElementById("fdmTotalChannelBandwidth").innerText = totalChannelBandwidth.toFixed(2);
    document.getElementById("fdmTotalGuardBandwidth").innerText = totalGuardBandwidth.toFixed(2);
    document.getElementById("fdmTotalBandwidth").innerText = totalBandwidth.toFixed(2);
    document.getElementById("fdmResult").classList.remove("hidden");
}

// Mostrar opciones dependiendo de lo que se seleccione
function toggleSyncOptions() {
    const syncType = document.getElementById("tdmSyncType").value;
    const syncBitsContainer = document.getElementById("syncBitsContainer");

    if (syncType === "bit") {
        syncBitsContainer.classList.remove("hidden");
    } else {
        syncBitsContainer.classList.add("hidden");
    }
}

function toggleInterleavingOptions() {
    const interleaving = document.getElementById("tdmInterleaving").value;
    const bitsPerSourceContainer = document.getElementById("bitsPerSourceContainer");

    if (interleaving === "bit") {
        bitsPerSourceContainer.classList.remove("hidden");
    } else {
        bitsPerSourceContainer.classList.add("hidden");
    }
}

// Se activa la opción de bits de sincronismo si se elige "bit" como sincronismo
function showSyncBitsInput() {
    const syncType = document.getElementById("tdmSyncType").value;
    const syncBitsContainer = document.getElementById("syncBitsContainer");

    // Si es nivel de bit, se habilita la entrada para bits de sincronismo
    if (syncType === "bit") {
        syncBitsContainer.classList.remove("hidden");
    } else {
        syncBitsContainer.classList.add("hidden");
    }
}

// Se activa la opción de cantidad de bits por fuente si se elige "bit" como tipo de entrelazado
function showBitsPerSourceInput() {
    const interleaving = document.getElementById("tdmInterleaving").value;
    const bitsPerSourceContainer = document.getElementById("bitsPerSourceContainer");

    // Si es nivel de bit, se habilita la entrada para bits por fuente
    if (interleaving === "bit") {
        bitsPerSourceContainer.classList.remove("hidden");
    } else {
        bitsPerSourceContainer.classList.add("hidden");
    }
}

// Mostrar o esconder las opciones de bits de sincronismo y bits por fuente según la selección
document.getElementById("tdmSyncType").addEventListener("change", toggleSyncOptions);
document.getElementById("tdmInterleaving").addEventListener("change", toggleInterleavingOptions);
document.getElementById("tdmSyncType").addEventListener("change", showSyncBitsInput);
document.getElementById("tdmInterleaving").addEventListener("change", showBitsPerSourceInput);
