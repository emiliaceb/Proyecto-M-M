const constellations = {
    ask: { x: [0, 1], y: [0, 0], colors: ["red", "blue"], phases: [0, 180] },
    psk: { x: [1, -1], y: [0, 0], colors: ["green", "purple"], phases: [0, 180] },
    "4ask": { x: [0, 1, 2, 3], y: [0, 0, 0, 0], colors: ["red", "blue", "green", "orange"], phases: [0, 90, 180, 270] },
    "4psk": { x: [1, 0, -1, 0], y: [0, 1, 0, -1], colors: ["yellow", "purple", "red", "blue"], phases: [0, 90, 180, 270] },
    qam: { x: [-1, 1, -1, 1], y: [-1, -1, 1, 1], colors: ["red", "blue", "green", "orange"], phases: [45, 135, 225, 315] },
    "8qam": { x: [1, 0, -1, 0, 2, 0, -2, 0], y: [0, 1, 0, -1, 0, 2, 0, -2], colors: ["purple", "red", "blue", "green", "orange", "yellow", "pink", "cyan"], phases: [45, 135, 225, 315, 0, 90, 180, 270] }
};

function plotModulation() {
    const type = document.getElementById("modulationSelect").value;
    const bits = document.getElementById("bitSequence").value.replace(/[^01]/g, "");

    if (bits.length === 0) {
        alert("Por favor, ingresa una secuencia de bits válida.");
        return;
    }

    if (!constellations[type]) {
        alert("Modulación no reconocida.");
        return;
    }

    const { x, y, colors, phases } = constellations[type];
    const bitValues = getBitValues(bits.length / 2);  // Asignar los valores de bits o dibits según el tipo de modulación

    // Crear el gráfico de constelación con símbolos como texto en cada punto
    const constellationTrace = {
        x: x,
        y: y,
        mode: "markers+text", // Mostrar marcadores y texto
        text: bitValues,  // Las etiquetas que se asociarán con los puntos
        textposition: 'top center', // Posición del texto sobre los puntos
        marker: { size: 12, color: colors },
        type: "scatter"
    };

    Plotly.newPlot("constellation", [constellationTrace], {
        title: `Diagrama de Constelación (${type.toUpperCase()})`,
        xaxis: { title: "Eje I (In-Phase)" },
        yaxis: { title: "Eje Q (Quadrature)" },
        showlegend: false
    });

    const { time, amplitude } = modulate(bits, type);
    const signalTrace = {
        x: time,
        y: amplitude,
        mode: "lines",
        type: "scatter",
        line: { color: "#4b6cb7" }
    };

    Plotly.newPlot("plot", [signalTrace], {
        title: `Señal Analógica (${type.toUpperCase()})`,
        xaxis: { title: "Tiempo" },
        yaxis: { title: "Amplitud" },
        showlegend: false
    });

    // Generar la tabla de verdad
    generateTruthTable(x, y, phases, type);
}

function modulate(bits, type) {
    const time = [];
    const amplitude = [];
    const cyclesPerSymbol = 2;

    const bitsPerSymbol = type === "qam" ? 2 : type === "8qam" ? 3 : 1;
    const points = constellations[type];

    for (let i = 0; i < bits.length; i += bitsPerSymbol) {
        if (i + bitsPerSymbol > bits.length) break;

        const idx = parseInt(bits.slice(i, i + bitsPerSymbol), 2);
        if (idx >= points.x.length) continue;

        const ix = points.x[idx];
        const qx = points.y[idx];

        const startTime = i / bitsPerSymbol;
        const endTime = startTime + 1;

        for (let t = 0; t <= 100; t++) {
            const timePoint = startTime + (t / 100) * (endTime - startTime);
            time.push(timePoint);
            amplitude.push(
                ix * Math.cos(2 * Math.PI * cyclesPerSymbol * (timePoint - startTime)) +
                qx * Math.sin(2 * Math.PI * cyclesPerSymbol * (timePoint - startTime))
            );
        }
    }

    return { time, amplitude };
}

function generateTruthTable(x, y, phases, modulationType) {
    const tableContainer = document.getElementById("truthTable");
    let tableHTML = "<table border='1'><tr><th>Bit/Dibit</th><th>Amplitud I</th><th>Amplitud Q</th><th>Fase (°)</th></tr>";

    // Determinar la cantidad de bits por símbolo según la modulación
    let bitsPerSymbol;
    if (modulationType === "qam" || modulationType === "4psk" || modulationType === "4ask") {
        bitsPerSymbol = 2; // 2 bits por símbolo
    } else if (modulationType === "8qam") {
        bitsPerSymbol = 3; // 3 bits por símbolo
    } else {
        bitsPerSymbol = 1; // 1 bit por símbolo
    }

    const bitValues = getBitValues(bitsPerSymbol);

    // Recorrer los puntos de la constelación
    for (let i = 0; i < x.length; i++) {
        const amplitudeI = x[i];
        const amplitudeQ = y[i];
        const phase = phases[i]; // Asignar fase según la modulación

        tableHTML += `<tr>
            <td>${bitValues[i]}</td>
            <td>${amplitudeI.toFixed(2)}</td>
            <td>${amplitudeQ.toFixed(2)}</td>
            <td>${phase}</td>
        </tr>`;
    }

    tableHTML += "</table>";
    tableContainer.innerHTML = tableHTML;
}

// Función para generar los valores de bits o dibits
function getBitValues(bitsPerSymbol) {
    const bitValues = [];
    const maxValue = Math.pow(2, bitsPerSymbol);

    for (let i = 0; i < maxValue; i++) {
        // Asegurarse de que los valores sean binarios de la longitud correcta
        bitValues.push(i.toString(2).padStart(bitsPerSymbol, "0"));
    }

    return bitValues;
}
