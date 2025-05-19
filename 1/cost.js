// cost.js – Histogramm € / Woche (ISO-Wochen)
// inkl. korrekter Tages-Aufteilung über Kalenderwochen
(() => {
  const parseDate  = d3.timeParse("%Y-%m-%d");
  const formatCost = d3.format(",.0f");
  const EUR        = v => formatCost(v).replace(/,/g, " ") + " €";

  // Kostensätze pro Personentag
  const intRate = 400;
  const extRate = 600;

  // Phasen mit durchschnittlichen Personentagen pro Kalendertag
  const phases = [
    { name: "Analyse",          start: "2025-05-28", end: "2025-06-13", daysPT: { int: 6/15,  ext: 14/15 } },
    { name: "Design",           start: "2025-06-16", end: "2025-07-03", daysPT: { int: 6/18,  ext: 30/18 } },
    { name: "Entwickeln",       start: "2025-07-04", end: "2025-09-10", daysPT: { int: 18/65, ext: 40/65 } },
    { name: "Implementierung",  start: "2025-09-11", end: "2025-09-26", daysPT: { int: 15/12, ext: 10/12 } },
    { name: "Evaluation",       start: "2025-09-29", end: "2025-10-07", daysPT: { int: 15/9,  ext: 6/9  } }
  ];

  // Einmal-Kosten-Events
  const events = [
    { date: "2025-05-28", type: "material", amount: 4000 },
    { date: "2025-07-24", type: "media",    amount: 2500 },
    { date: "2025-06-23", type: "lic",      amount: 160  },
    { date: "2025-07-21", type: "lic",      amount: 160  },
    { date: "2025-08-25", type: "lic",      amount: 160  },
    { date: "2025-09-08", type: "lic",      amount: 500  }
  ];

  // 1) Alle Tage inklusive Wochenenden sammeln
  function allDays(start, end) {
    const s = parseDate(start), e = parseDate(end);
    const dates = [];
    let d = new Date(s);
    while (d <= e) {
      dates.push(d.toISOString().slice(0, 10));
      d.setDate(d.getDate() + 1);
    }
    return dates;
  }

  // 2) Tageskarten für Kosten
  const dayCost = new Map();
  phases.forEach(ph => {
    const days = allDays(ph.start, ph.end);
    days.forEach(date => {
      const v = dayCost.get(date) || { int: 0, ext: 0, lic: 0, media: 0, mat: 0, total: 0 };
      v.int   += ph.daysPT.int * intRate;
      v.ext   += ph.daysPT.ext * extRate;
      v.total += ph.daysPT.int * intRate + ph.daysPT.ext * extRate;
      dayCost.set(date, v);
    });
  });

  // 3) Einmal-Events ergänzen
  events.forEach(ev => {
    const v = dayCost.get(ev.date) || { int: 0, ext: 0, lic: 0, media: 0, mat: 0, total: 0 };
    if (ev.type === "material") v.mat   += ev.amount;
    if (ev.type === "media")    v.media += ev.amount;
    if (ev.type === "lic")      v.lic   += ev.amount;
    v.total += ev.amount;
    dayCost.set(ev.date, v);
  });

  // 4) Wochen-Bins erzeugen (Montag bis Sonntag)
  const allDates = [...dayCost.keys()];
  const first    = parseDate(d3.min(allDates));
  const last     = parseDate(d3.max(allDates));
  const weeks    = d3.timeMonday.range(
    d3.timeMonday.floor(first),
    d3.timeMonday.offset(d3.timeMonday.ceil(last), 1)
  );

  const weekData = weeks.map(w => {
    const wEnd = d3.timeDay.offset(w, 7);
    const agg  = { week: w, int: 0, ext: 0, lic: 0, media: 0, mat: 0, total: 0 };
    for (let d = new Date(w); d < wEnd; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().slice(0, 10);
      const v   = dayCost.get(key);
      if (v) Object.keys(v).forEach(k => agg[k] += v[k]);
    }
    return agg;
  });

  // 5) Chart zeichnen
  window.addEventListener("DOMContentLoaded", () => {
    const margin = { top: 95, right: 40, bottom: 60, left: 80 },
          width  = 1200 - margin.left - margin.right,
          height = 400;

    const svg = d3.select("#cost-chart")
      .append("svg")
        .attr("width",  width  + margin.left + margin.right)
        .attr("height", height + margin.top  + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime()
      .domain([ weeks[0], d3.timeMonday.offset(weeks.at(-1),1) ])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(weekData, d => d.total)]).nice()
      .range([height, 0]);

    // untere Achse: Datum
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x)
        .ticks(d3.timeMonth.every(1))
        .tickFormat(d3.timeFormat("%d. %b"))
      )
      .selectAll("text")
        .attr("transform","rotate(-45)")
        .style("text-anchor","end");

    // obere Achse: KW mittig
    svg.append("g")
      .attr("class","kw-axis")
      .call(d3.axisTop(x)
        .ticks(d3.timeMonday.every(1))
        .tickSize(0)
        .tickFormat(d => `KW ${d3.timeFormat("%W")(d)}`)
      )
      .selectAll("text")
        .attr("text-anchor","middle")
        .attr("transform",(d) => {
          const start = x(d),
                end   = x(d3.timeMonday.offset(d,1));
          return `translate(${(end - start)/2},0)`;
        })
        .attr("font-size",11)
        .attr("fill","#555");

    // linke Achse: Kosten
    svg.append("g")
      .call(d3.axisLeft(y)
        .ticks(6)
        .tickFormat(EUR)
      );

    // Balken
    const barW = x(d3.timeMonday.offset(weeks[0],1)) - x(weeks[0]) - 1;
    svg.selectAll("rect.bar")
      .data(weekData)
      .enter().append("rect")
        .attr("class","bar")
        .attr("x",      d => x(d.week))
        .attr("y",      d => y(d.total))
        .attr("width",  barW)
        .attr("height", d => height - y(d.total))
        .attr("fill",   "#26a69a")
        .attr("rx",     3);

    // Titel
    svg.append("text")
      .attr("x", width/2).attr("y", -55)
      .attr("text-anchor","middle")
      .attr("font-size",18)
      .attr("font-weight",600)
      .text("Kostenhistogramm (€/Woche)");

    // Tooltip
    const tooltip = d3.select("#tooltip");
    svg.selectAll("rect.bar")
      .on("mouseover", (ev, d) => {
        const lines = [
          `<strong>KW ${d3.timeFormat("%W")(d.week)}</strong>`,
          `Gesamt: <strong>${EUR(d.total)}</strong>`
        ];
        if (d.ext)   lines.push(`• Externe Spezialisten: ${EUR(d.ext)}`);
        if (d.int)   lines.push(`• Internes Kernteam: ${EUR(d.int)}`);
        if (d.media) lines.push(`• Medienproduktion: ${EUR(d.media)}`);
        if (d.lic)   lines.push(`• Lizenzen: ${EUR(d.lic)}`);
        if (d.mat)   lines.push(`• Sachmittel & Geräte: ${EUR(d.mat)}`);
        tooltip.html(lines.join("<br>"))
               .style("left", `${ev.pageX+12}px`)
               .style("top",  `${ev.pageY+12}px`)
               .style("opacity", 1);
      })
      .on("mousemove", ev => {
        tooltip.style("left",`${ev.pageX+12}px`)
               .style("top", `${ev.pageY+12}px`);
      })
      .on("mouseout", () => tooltip.style("opacity",0));
  });
})();
