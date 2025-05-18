// cost.js – Histogramm €/Woche (ISO-Wochen, Lizenz-Staffelung)
(() => {
  const parseDate  = d3.timeParse("%Y-%m-%d");
  const formatCost = d3.format(".2~s");
  const EUR        = v => formatCost(v).replace('k',' Tsd.') + ' €';

  const extRate  = 600;  // €/PT externer Berater
  const intRate  = 400;  // €/PT intern
  const testLicW = 600;  // volle Lizenzkosten in Implement./Eval.
  const postLicW = 150;  // Betriebslizenz ab Go-Live

  // Definition der Phasen mit externen/int. Personentagen
  const phases = [
    { name:'Analyse',         start:'2025-05-28', end:'2025-06-06', extPT:0.8, intPT:0.7 },
    { name:'Design',          start:'2025-06-09', end:'2025-06-20', extPT:1.2, intPT:0.6 },
    { name:'Entwickeln',      start:'2025-06-23', end:'2025-08-01', extPT:1.5, intPT:0.5 },
    { name:'Implementierung', start:'2025-09-11', end:'2025-09-19', extPT:1.0, intPT:0.5 },
    { name:'Evaluation',      start:'2025-09-29', end:'2025-10-07', extPT:0.6, intPT:0.4 }
  ];

  function workingDays(start, end) {
    const a = parseDate(start), b = parseDate(end);
    let d = new Date(a), cnt = 0;
    while (d <= b) {
      if (d.getDay() !== 0 && d.getDay() !== 6) cnt++;
      d.setDate(d.getDate() + 1);
    }
    return cnt;
  }

  // 1) Tages-Kosten berechnen
  const dayCost = new Map(); // key = 'YYYY-MM-DD' => {ext,int,lic,total}
  phases.forEach(ph => {
    const days     = workingDays(ph.start, ph.end);
    const licPerDay = (ph.name==='Implementierung'||ph.name==='Evaluation')
                     ? testLicW/5 : 0;
    let cur = new Date(parseDate(ph.start));
    for (let i=0; i<days; i++) {
      const key = cur.toISOString().slice(0,10);
      const prev = dayCost.get(key) || {ext:0, int:0, lic:0, total:0};
      const ext   = ph.extPT * extRate;
      const intl  = ph.intPT * intRate;
      const lic   = licPerDay;
      prev.ext   += ext;
      prev.int   += intl;
      prev.lic   += lic;
      prev.total += ext + intl + lic;
      dayCost.set(key, prev);
      cur.setDate(cur.getDate()+1);
    }
  });

  // 2) Wochen-Bins (ISO-Wochen, Montag–Sonntag)
  const dates = Array.from(dayCost.keys());
  const first = parseDate(d3.min(dates));
  const last  = parseDate(d3.max(dates));
  const weeks = d3.timeMonday.range(
    d3.timeMonday.floor(first),
    d3.timeMonday.offset(d3.timeMonday.ceil(last), 1)
  );

  // Go-Live-Tag (Tag nach Evaluation-Ende)
  const lastPhase = phases[phases.length - 1];
  const goLive = d3.timeDay.offset(parseDate(lastPhase.end), 1);

  // 3) Wochen-Daten aggregieren
  const weekData = weeks.map(w => {
    const wEnd = d3.timeDay.offset(w, 7);
    let ext=0, intl=0, lic=0, total=0;
    for (let d=new Date(w); d<wEnd; d.setDate(d.getDate()+1)) {
      const v = dayCost.get(d.toISOString().slice(0,10));
      if (v) { ext+=v.ext; intl+=v.int; lic+=v.lic; total+=v.total; }
    }
    // ab Go-Live: regelmäßige Betriebslizenz
    if (w >= goLive) {
      lic   += postLicW;
      total += postLicW;
    }
    return { week:w, ext, intl, lic, total };
  });

  // 4) Chart zeichnen
  window.addEventListener('DOMContentLoaded', () => {
    const margin = { top:95, right:40, bottom:60, left:80 },
          width  = 1200 - margin.left - margin.right,
          height = 400;

    const svg = d3.select('#cost-chart')
      .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height',height + margin.top + margin.bottom)
      .append('g')
        .attr('transform',`translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime()
      .domain([weeks[0], d3.timeMonday.offset(weeks.at(-1),1)])
      .range([0, width]);
    const y = d3.scaleLinear()
      .domain([0,d3.max(weekData,d=>d.total)]).nice()
      .range([height, 0]);

    // Achsen
    svg.append('g').attr('transform',`translate(0,${height})`)
      .call(d3.axisBottom(x)
        .ticks(d3.timeMonth.every(1))
        .tickFormat(d3.timeFormat('%b %Y'))
      )
      .selectAll('text')
        .attr('transform','rotate(-45)')
        .style('text-anchor','end');

    svg.append('g')
      .call(d3.axisTop(x)
        .ticks(d3.timeMonday.every(1))
        .tickSize(0)
        .tickFormat(d => 'KW ' + d3.timeFormat('%W')(d))
      )
      .selectAll('text')
        .attr('font-size',11)
        .attr('fill','#555');

    svg.append('g')
      .call(d3.axisLeft(y)
        .ticks(6)
        .tickFormat(EUR)
      );

    // Balken
    const barW = x(d3.timeMonday.offset(weeks[0],1)) - x(weeks[0]) - 1;
    svg.selectAll('rect.bar')
       .data(weekData)
       .enter().append('rect')
         .attr('class','bar')
         .attr('x',    d => x(d.week))
         .attr('y',    d => y(d.total))
         .attr('width',barW)
         .attr('height', d => height - y(d.total))
         .attr('fill','#26a69a')
         .attr('rx', 3);

    // Titel
    svg.append('text')
       .attr('x', width/2).attr('y',-55)
       .attr('text-anchor','middle')
       .attr('font-size',18).attr('font-weight',600)
       .text('Kostenhistogramm (€/Woche)');

    // Tooltip
    const tooltip = d3.select('#tooltip');
    svg.selectAll('rect.bar')
       .on('mouseover',(ev,d) => {
         tooltip.html(
           `<strong>KW ${d3.timeFormat('%W')(d.week)}</strong><br>` +
           `Gesamt: <strong>${EUR(d.total)}</strong><br>` +
           `• Externe Berater: ${EUR(d.ext)}<br>` +
           `• Interne Arbeitszeit: ${EUR(d.intl)}<br>` +
           `• Lizenz & Tools: ${EUR(d.lic)}`
         )
         .style('left',`${ev.pageX+12}px`)
         .style('top', `${ev.pageY+12}px`)
         .style('opacity',1);
       })
       .on('mousemove', ev => {
         tooltip
           .style('left',`${ev.pageX+12}px`)
           .style('top', `${ev.pageY+12}px`);
       })
       .on('mouseout', () => tooltip.style('opacity',0));
  });
})();
