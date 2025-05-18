# Projekt: Schulungskonzept-Dashboard

Dieses Repository wurde im Rahmen der Fallstudie 4 des Moduls Informationswirtschaft an der HTW Berlin erstellt. Ziel ist die Entwicklung eines interaktiven Dashboards zur Visualisierung eines Schulungskonzepts. Es dient dazu, den Zeit- und Kostenplan eines Schulungsprojekts strukturiert darzustellen und wurde von Benjamin Masters entwickelt.

Das Repository enthält zwei interaktive Mini-Sites:

* **Zeitplan (Gantt-Diagramm)** unter `http://localhost:8080/`
* **Kostenplan (Kost-Histogramm)** unter `http://localhost:8080/1/`

## Voraussetzungen

* Git
* Node.js & npm (für `npx http-server`)
* Moderner Browser (Chrome, Chromium, Safari) kein Firefox!!!

## Installation & Start

1. **Repository klonen**

   ```bash
   git clone https://github.com/dein-username/schulungskonzept-dashboard.git
   cd schulungskonzept-dashboard
   ```

2. **Lokalen HTTP-Server starten**

   Empfohlener Befehl: **`npx http-server`** auf Port 8080:

   ```bash
   npx http-server -p 8080
   ```

   Dieser Befehl startet einen statischen Server aus dem aktuellen Verzeichnis.

3. **Dashboard im Browser öffnen**

   * Zeitplan:  `http://localhost:8080/`
   * Kostenplan: `http://localhost:8080/1/`

   Das Dashboard ermöglicht eine übersichtliche Darstellung des Projektzeitplans und der Kostenplanung.


## Anpassungen

* **Port ändern**: `npx http-server -p 3000` → `http://localhost:3000/`

* **Start aus IDE**: Der Befehl kann auch im integrierten Terminal von PyCharm oder VS Code ausgeführt werden.


© 2025 Benjamin Masters, HTW Berlin
