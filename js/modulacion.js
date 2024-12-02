 let modulationChart, constellationChart;

    function plot() {
      const bits = document.getElementById("bits").value.trim();
      const modulation = document.getElementById("modulation").value;
      document.getElementById("constellationContainer").style.display = "block";
      document.getElementById("modulationContainer").style.display = "block";
      document.getElementById("truthTableContainer").style.display = "block";


      if (!bits || !/^[01]+$/.test(bits)) {
        alert("Por favor, ingrese una secuencia válida de bits (solo 0 y 1).");
        return;
      }

      const bitDuration = 1;
      const samplingRate = 100;
      const carrierFrequency = 1;
      const time = [];
      const signal = [];
      let currentTime = 0;

      const symbols = [];
      const amplitudes = [0.5, 1, 1.5, 2];
      const phases = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];

      if (["4ASK", "4PSK", "8QAM", "QAM"].includes(modulation)) {
        for (let i = 0; i < bits.length; i += (modulation === "8QAM" ? 3 : 2)) {
          const symbol = bits.slice(i, i + (modulation === "8QAM" ? 3 : 2));
          if (symbol.length < (modulation === "8QAM" ? 3 : 2)) break;
          symbols.push(parseInt(symbol, 2));
        }
      } else {
        symbols.push(...bits.split("").map(b => parseInt(b)));
      }

      for (const symbol of symbols) {
        for (let i = 0; i < samplingRate; i++) {
          const t = currentTime + i / samplingRate;
          time.push(t);
          let value = 0;

          if (modulation === "ASK") {
            value = symbol === 1 ? Math.sin(2 * Math.PI * carrierFrequency * t) : 0;
          } else if (modulation === "FSK") {
            const freq = symbol === 1 ? carrierFrequency + 0.5 : carrierFrequency - 0.5;
            value = Math.sin(2 * Math.PI * freq * t);
          } else if (modulation === "PSK") {
            const phase = symbol === 1 ? 0 : Math.PI;
            value = Math.sin(2 * Math.PI * carrierFrequency * t + phase);
          } else if (modulation === "4ASK") {
            value = amplitudes[symbol] * Math.sin(2 * Math.PI * carrierFrequency * t);
          } else if (modulation === "4PSK") {
            const phase = phases[symbol];
            value = Math.sin(2 * Math.PI * carrierFrequency * t + phase);
          } else if (modulation === "8QAM") {
            const amplitudes8QAM = [1, 2];
            const phases8QAM = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
            const idx = symbol;
            value = amplitudes8QAM[idx % 2] * Math.sin(2 * Math.PI * carrierFrequency * t + phases8QAM[Math.floor(idx / 2)]);
          } else if (modulation === "QAM") {
            const phasesQAM = [Math.PI / 4, 3 * Math.PI / 4, 5 * Math.PI / 4, 7 * Math.PI / 4];
            value = Math.sin(2 * Math.PI * carrierFrequency * t + phasesQAM[symbol]);
          }

          signal.push(value);
        }
        currentTime += bitDuration;
      }

      const constellation = [];
      if (modulation === "ASK") {
        constellation.push({ x: 1, y: 0 }, { x: 0, y: 0 });
      } else if (modulation === "FSK") {
        constellation.push({ x: carrierFrequency - 0.5, y: 0 }, { x: carrierFrequency + 0.5, y: 0 });
      } else if (modulation === "PSK") {
        constellation.push({ x: 1, y: 0 }, { x: -1, y: 0 });
      } else if (modulation === "4ASK") {
        amplitudes.forEach(a => constellation.push({ x: a, y: 0 }));
      } else if (modulation === "4PSK") {
        phases.forEach(p => constellation.push({ x: Math.cos(p), y: Math.sin(p) }));
      } else if (modulation === "8QAM") {
        const amplitudes8QAM = [1, 2];
        const phases8QAM = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
        for (let i = 0; i < 8; i++) {
          constellation.push({
            x: amplitudes8QAM[i % 2] * Math.cos(phases8QAM[Math.floor(i / 2)]),
            y: amplitudes8QAM[i % 2] * Math.sin(phases8QAM[Math.floor(i / 2)]),
          });
        }
      } else if (modulation === "QAM") {
        const phasesQAM = [Math.PI / 4, 3 * Math.PI / 4, 5 * Math.PI / 4, 7 * Math.PI / 4];
        for (let i = 0; i < 4; i++) {
          constellation.push({ x: Math.cos(phasesQAM[i]), y: Math.sin(phasesQAM[i]) });
        }
      }

      if (modulationChart) modulationChart.destroy();
      const modCtx = document.getElementById("modulationChart").getContext("2d");
      modulationChart = new Chart(modCtx, {
        type: "line",
        data: {
          labels: time,
          datasets: [{
            label: modulation,
            data: signal,
            borderColor: "#f39c12",
            borderWidth: 1,
            pointRadius: 0,
          }]
        },
        options: {
          responsive: true,
          scales: {
            x: { title: { display: true, text: "Tiempo (s)" } },
            y: { title: { display: true, text: "Amplitud" } }
          }
        }
      });

      if (constellationChart) constellationChart.destroy();
      const constCtx = document.getElementById("constellationChart").getContext("2d");
      constellationChart = new Chart(constCtx, {
        type: "scatter",
        data: {
          datasets: [{
            label: "Constelación",
            data: constellation,
            backgroundColor: "#f39c12",
            pointRadius: 8,
          }]
        },
        options: {
          responsive: true,
          scales: {
            x: { title: { display: true, text: "Eje I (In-Phase)" } },
            y: { title: { display: true, text: "Eje Q (Quadrature)" } }
          }
        }
      });

      displayTruthTable(modulation);
    }

    function displayTruthTable(modulation) {
      const container = document.getElementById("truthTableContainer");
      container.innerHTML = "";

      const tables = {
        "ASK": `
          <h2>Tabla de Verdad - ASK</h2>
          <table>
            <tr><th>Bit</th><th>Amplitud</th></tr>
            <tr><td>0</td><td>0</td></tr>
            <tr><td>1</td><td>Máxima</td></tr>
          </table>`,
        "FSK": `
          <h2>Tabla de Verdad - FSK</h2>
          <table>
            <tr><th>Bit</th><th>Frecuencia</th></tr>
            <tr><td>0</td><td>f1</td></tr>
            <tr><td>1</td><td>f2</td></tr>
          </table>`,
        "PSK": `
          <h2>Tabla de Verdad - PSK</h2>
          <table>
            <tr><th>Bit</th><th>Fase</th></tr>
            <tr><td>0</td><td>0°</td></tr>
            <tr><td>1</td><td>180°</td></tr>
          </table>`,
        "4ASK": `
          <h2>Tabla de Verdad - 4ASK</h2>
          <table>
            <tr><th>Bits</th><th>Amplitud</th></tr>
            <tr><td>00</td><td>A1</td></tr>
            <tr><td>01</td><td>A2</td></tr>
            <tr><td>10</td><td>A3</td></tr>
            <tr><td>11</td><td>A4</td></tr>
          </table>`,
        "4PSK": `
          <h2>Tabla de Verdad - 4PSK</h2>
          <table>
            <tr><th>Bits</th><th>Fase</th></tr>
            <tr><td>00</td><td>0°</td></tr>
            <tr><td>01</td><td>90°</td></tr>
            <tr><td>10</td><td>180°</td></tr>
            <tr><td>11</td><td>270°</td></tr>
          </table>`,
        "8QAM": `
          <h2>Tabla de Verdad - 8QAM</h2>
          <table>
            <tr><th>Bits</th><th>Fase</th><th>Amplitud</th></tr>
            <tr><td>000</td><td>0°</td><td>1</td></tr>
            <tr><td>001</td><td>0°</td><td>2</td></tr>
            <tr><td>010</td><td>90°</td><td>1</td></tr>
            <tr><td>011</td><td>90°</td><td>2</td></tr>
            <tr><td>100</td><td>180°</td><td>1</td></tr>
            <tr><td>101</td><td>180°</td><td>2</td></tr>
            <tr><td>110</td><td>270°</td><td>1</td></tr>
            <tr><td>111</td><td>270°</td><td>2</td></tr>
          </table>`,
        "QAM": `
          <h2>Tabla de Verdad - QAM</h2>
          <table>
            <tr><th>Bits</th><th>Fase</th></tr>
            <tr><td>00</td><td>45°</td></tr>
            <tr><td>01</td><td>135°</td></tr>
            <tr><td>10</td><td>225°</td></tr>
            <tr><td>11</td><td>315°</td></tr>
          </table>`,
      };

      container.innerHTML = tables[modulation];
    }
