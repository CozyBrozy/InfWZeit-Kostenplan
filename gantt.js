// gantt.js
// D3 ist global verfügbar

// 1) Parser & Formatter
const parseDate  = d3.timeParse("%Y-%m-%d");
const formatDate = d3.timeFormat("%d.%m.%Y");

// 2) Dauer (Arbeitstage) ermitteln
function calcDuration(start, end) {
  const a = parseDate(start), b = parseDate(end);
  return Math.round((b - a) / (1000*60*60*24)) + 1;
}

// 3) Kurzbeschreibungen (aus aktualisierter Tabelle)
const descriptions = {
  1: 'Ist-Soll-Vergleich, Ressourcen, Motivation, Wissen ermitteln',
  2: 'Messbare Schulungsziele formulieren',
  3: 'Teilnehmerzahl, Vorwissen und Lernstile analysieren',
  4: 'Benötigte Ressourcen erfassen und Schulungsformen auswählen',
  5: 'Rollen, Risiken und Kommunikation festlegen',
  6: 'Arbeitsschritte zerlegen und Line-of-Sight sichern',
  7: 'Bedingungen, Leistungen und Kriterien pro Task formulieren',
  8: 'Prüfstrategie pro Objective festlegen',
  9: 'Design-Entwürfe präsentieren, Feedback einarbeiten, Freigabe einholen',
  10: 'Lerninhalte und Übungen entwickeln oder auswählen',
  11: 'E-Learning, Videos, Handzettel und Präsentationen erstellen/auswählen',
  12: 'Ablauf, Aufgaben und Transferhilfen im Leitfaden festhalten',
  13: 'Moderationsskript, Timing und Materialien für Trainer erstellen',
  14: 'Feedback einarbeiten (min. 2 Zyklen)',
  15: 'Gesamtschulung mit Pilotgruppe testen, Wirksamkeit prüfen',
  16: 'Interne Trainer schulen und zertifizieren',
  17: 'Lernumgebung, Räume und Geräte einrichten',
  18: 'Einladungen und Zugänge versenden',
  19: 'Erste Durchführung mit Support und Datenerhebung',
  20: 'Zufriedenheit direkt nach dem Modul erfassen',
  21: 'Wissen und Fertigkeiten testen',
  22: 'Anwendung am Arbeitsplatz prüfen',
  23: 'Daten konsolidieren, Verbesserungen & ROI berichten'
};

// 4) Task-Definition mit neuen Start/End-Daten (Working Days)
const tasks = [
  { id: 1,  name: 'Soll-Ist-Vergleich',                start: '2025-05-28', end: '2025-05-30', color: '#3498db', phase: 'Analyse' },
  { id: 2,  name: 'Schulungsziele formulieren',         start: '2025-06-02', end: '2025-06-03', color: '#3498db', phase: 'Analyse' },
  { id: 3,  name: 'Zielgruppenanalyse',                start: '2025-06-04', end: '2025-06-05', color: '#3498db', phase: 'Analyse' },
  { id: 4,  name: 'Ressourcen- & Schulungsformanalyse',start: '2025-06-06', end: '2025-06-10', color: '#3498db', phase: 'Analyse' },
  { id: 5,  name: 'Rollen-, Risiken- & Kommunikation', start: '2025-06-11', end: '2025-06-13', color: '#3498db', phase: 'Analyse' },
  { id: 6,  name: 'Arbeitsschritte zerlegen',            start: '2025-06-16', end: '2025-06-19', color: '#9b59b6', phase: 'Design' },
  { id: 7,  name: 'Bedingungen, Leistungen & Kriterien',start: '2025-06-20', end: '2025-06-24', color: '#9b59b6', phase: 'Design' },
  { id: 8,  name: 'Bewertungsstrategie',                 start: '2025-06-25', end: '2025-06-26', color: '#9b59b6', phase: 'Design' },
  { id: 9,  name: 'Design-Review & Freigabe',            start: '2025-06-27', end: '2025-07-03', color: '#9b59b6', phase: 'Design' },
  { id: 10, name: 'Inhalte erstellen',                   start: '2025-07-04', end: '2025-07-29', color: '#e67e22', phase: 'Entwickeln' },
  { id: 11, name: 'Medien produzieren / auswählen',     start: '2025-07-30', end: '2025-08-22', color: '#e67e22', phase: 'Entwickeln' },
  { id: 12, name: 'Lernendenleitfaden',                  start: '2025-08-25', end: '2025-08-27', color: '#e67e22', phase: 'Entwickeln' },
  { id: 13, name: 'Trainerleitfaden',                    start: '2025-08-28', end: '2025-09-01', color: '#e67e22', phase: 'Entwickeln' },
  { id: 14, name: 'Formative Revision',                   start: '2025-09-02', end: '2025-09-05', color: '#e67e22', phase: 'Entwickeln' },
  { id: 15, name: 'Pilot-Test',                           start: '2025-09-08', end: '2025-09-10', color: '#e67e22', phase: 'Entwickeln' },
  { id: 16, name: 'Train-the-Trainer',                   start: '2025-09-11', end: '2025-09-12', color: '#2ecc71', phase: 'Implementierung' },
  { id: 17, name: 'Lernumgebung einrichten',              start: '2025-09-15', end: '2025-09-17', color: '#2ecc71', phase: 'Implementierung' },
  { id: 18, name: 'Teilnehmer informieren',               start: '2025-09-18', end: '2025-09-19', color: '#2ecc71', phase: 'Implementierung' },
  { id: 19, name: 'Roll-out Welle 1',                     start: '2025-09-22', end: '2025-09-26', color: '#2ecc71', phase: 'Implementierung' },
  { id: 20, name: 'Evaluation 1',                         start: '2025-09-29', end: '2025-09-29', color: '#e74c3c', phase: 'Evaluation' },
  { id: 21, name: 'Evaluation 2',                         start: '2025-09-30', end: '2025-09-30', color: '#e74c3c', phase: 'Evaluation' },
  { id: 22, name: 'Evaluation 3',                         start: '2025-10-01', end: '2025-10-02', color: '#e74c3c', phase: 'Evaluation' },
  { id: 23, name: 'Ergebnisanalyse',                      start: '2025-10-03', end: '2025-10-07', color: '#e74c3c', phase: 'Evaluation' }
];

// 5) Layout-Parameter
const margin = { top: 80, right: 150, bottom: 60, left: 260 };
const width  = 1200 - margin.left - margin.right;
const height = tasks.length * 40;

// 6) Hover-Bereiche (mit Ein-Tages-Regel)
const MIN_HOVER_WIDTH = 80;
const ONE_DAY_WIDTH   = 20;

window.addEventListener('DOMContentLoaded', () => {
  const svg = d3.select('#gantt')
    .append('svg')
      .attr('class','gantt-svg')
      .attr('width',  width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
    .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

  // Pfeil-Definition
  const defs = svg.append('defs');
  defs.append('marker')
    .attr('id','arrow')
    .attr('viewBox','0 -5 10 10')
    .attr('refX',10).attr('refY',0)
    .attr('markerWidth',5).attr('markerHeight',5)
    .attr('orient','auto')
    .append('path')
      .attr('d','M0,-5L10,0L0,5')
      .attr('fill','#888');

  // Zeilen-Raster
  svg.append('g').attr('class','row-grid')
    .selectAll('line')
    .data(d3.range(tasks.length+1))
    .enter()
    .append('line')
      .attr('x1',0).attr('x2',width)
      .attr('y1',d=>d*(height/tasks.length))
      .attr('y2',d=>d*(height/tasks.length));

  // Skalen
  const xScale = d3.scaleTime()
    .domain([ new Date('2025-05-28'), new Date('2025-10-07') ])
    .range([0, width]);
  const yScale = d3.scaleBand()
    .domain(d3.range(tasks.length))
    .range([0, height])
    .padding(0.2);

  // obere KW-Achse
  svg.append('g')
    .call(d3.axisTop(xScale)
      .ticks(d3.timeWeek.every(1))
      .tickFormat(d => 'KW ' + d3.timeFormat('%W')(d))
    );

  // untere Datums-Achse
  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(xScale)
      .ticks(d3.timeWeek.every(1))
      .tickFormat(d3.timeFormat('%d. %b'))
    )
    .selectAll('text')
      .attr('transform','rotate(-45)')
      .style('text-anchor','end');

  // linke Task-Achse
  svg.append('g')
    .call(d3.axisLeft(yScale)
      .tickFormat(i => tasks[i].name)
    );

  // vertikales Spalten-Raster
  svg.append('g')
    .attr('class','grid')
    .call(d3.axisBottom(xScale)
      .ticks(d3.timeWeek.every(1))
      .tickSize(-height)
      .tickFormat('')
    )
    .attr('transform', `translate(0,${height})`)
    .selectAll('line')
      .attr('stroke','#e0e0e0')
      .attr('stroke-dasharray','4,4');

  // Tooltip
  const tooltip = d3.select('.tooltip');

  // Balken zeichnen
  svg.selectAll('rect.task-bar')
    .data(tasks)
    .enter()
    .append('rect')
      .attr('class','task-bar')
      .attr('x',     d => xScale(parseDate(d.start)))
      .attr('y',     (_,i) => yScale(i))
      .attr('width', d => xScale(parseDate(d.end)) - xScale(parseDate(d.start)) + 1)
      .attr('height', yScale.bandwidth())
      .attr('rx', 6).attr('ry', 6)
      .attr('fill', d => d.color);

  // Hit-Areas für Hover
  svg.selectAll('rect.hitarea')
    .data(tasks)
    .enter()
    .append('rect')
      .attr('class','hitarea')
      .attr('fill','transparent')
      .style('cursor','pointer')
      .attr('y', (_,i) => yScale(i) - 2)
      .attr('height', yScale.bandwidth() + 4)
      .attr('x', d => {
        const x0 = xScale(parseDate(d.start));
        const w  = xScale(parseDate(d.end)) - x0;
        const days = calcDuration(d.start, d.end);
        let hoverW = (days === 1)
          ? Math.max(ONE_DAY_WIDTH, MIN_HOVER_WIDTH)
          : Math.max(w * 5, MIN_HOVER_WIDTH);
        return x0 - (hoverW - w) / 2;
      })
      .attr('width', d => {
        const x0 = xScale(parseDate(d.start));
        const w  = xScale(parseDate(d.end)) - x0;
        const days = calcDuration(d.start, d.end);
        return (days === 1)
          ? Math.max(ONE_DAY_WIDTH, MIN_HOVER_WIDTH)
          : Math.max(w * 5, MIN_HOVER_WIDTH);
      })
      .on('mouseover', (event, d) => {
        tooltip.html(
          `<strong>${d.name}:</strong><br/>` +
          `Dauer: ${calcDuration(d.start, d.end)} Tage<br/>` +
          `Start: ${formatDate(parseDate(d.start))}<br/>` +
          `Ende: ${formatDate(parseDate(d.end))}` +
          `<br/><br/><em>Kurzbeschreibung:</em> ${descriptions[d.id]}`
        )
        .style('left',  (event.pageX + 12) + 'px')
        .style('top',   (event.pageY + 12) + 'px')
        .style('opacity', 1);
      })
      .on('mousemove', event => {
        tooltip
          .style('left', (event.pageX + 12) + 'px')
          .style('top',  (event.pageY + 12) + 'px');
      })
      .on('mouseout', () => {
        tooltip.style('opacity', 0);
      });

  // curved Pfeile
  const lineGen = d3.line().curve(d3.curveBasis);
  tasks.slice(0,-1).forEach((d,i) => {
    const next = tasks[i+1];
    const p1 = [ xScale(parseDate(d.end)),            yScale(i) + yScale.bandwidth()/2 ];
    const p2 = [ xScale(parseDate(d.end)) + 20,       p1[1] ];
    const p3 = [ xScale(parseDate(next.start)) - 20,  yScale(i+1) + yScale.bandwidth()/2 ];
    const p4 = [ xScale(parseDate(next.start)),       p3[1] ];
    svg.append('path')
      .attr('d', lineGen([p1,p2,p3,p4]))
      .attr('fill','none')
      .attr('stroke','#888')
      .attr('stroke-width',2)
      .attr('marker-end','url(#arrow)');
  });

  // Legende mit deutschen Phasen
  const phases = [
    { name: 'Analyse',         color: '#3498db' },
    { name: 'Design',          color: '#9b59b6' },
    { name: 'Entwickeln',      color: '#e67e22' },
    { name: 'Implementierung', color: '#2ecc71' },
    { name: 'Evaluation',      color: '#e74c3c' }
  ];
  const legend = svg.append('g')
    .attr('class','legend')
    .attr('transform', `translate(${width - 160}, 20)`);

  legend.append('rect')
    .attr('x',0).attr('y',0)
    .attr('width',140).attr('height', phases.length*20 + 30)
    .attr('fill','#ffffff')
    .attr('stroke','#cccccc')
    .attr('rx',4).attr('ry',4);

  legend.append('text')
    .attr('x',10).attr('y',15)
    .attr('font-weight','bold')
    .text('Phasen:');

  legend.selectAll('g')
    .data(phases)
    .enter().append('g')
      .attr('transform', (_,i) => `translate(10, ${i*20 + 30})`)
    .call(g => {
      g.append('rect')
        .attr('width',12).attr('height',12)
        .attr('fill', d => d.color);
      g.append('text')
        .attr('x',18).attr('y',0)
        .text(d => d.name);
    });
});
