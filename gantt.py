#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gantt-Diagramm für das Schulungskonzept von TechGadgets
Erstellt mit pandas + matplotlib (getestet unter Python 3.10)
"""

from datetime import datetime, timedelta
import pandas as pd
import matplotlib.pyplot as plt

# ----------------------------------------------------------------------
# 1) Rohdaten – Vorgänge, Dauer (AT = Arbeitstage), Vorgänger-IDs
#    -> Wenn du etwas ändern willst, mach’s hier.
# ----------------------------------------------------------------------
TASKS = [
    {"ID": 1,  "Task": "Projekt-Kick-off & Zieldefinition",                    "Duration": 5,  "Predecessors": [],             "Resource": "IT-Leitung / HR"},
    {"ID": 2,  "Task": "Detail-Anforderungsanalyse",                            "Duration": 3,  "Predecessors": [1],            "Resource": "IT-Leitung"},
    {"ID": 3,  "Task": "Entwicklung Präsentation & Workshop-Unterlagen",       "Duration": 10, "Predecessors": [2],            "Resource": "Externer Content-Experte"},
    {"ID": 4,  "Task": "Auswahl + Customizing E-Learning-Module",              "Duration": 15, "Predecessors": [2],            "Resource": "IT + Anbieter"},
    {"ID": 5,  "Task": "Gestaltung Handzettel & Kommunikationspaket",          "Duration": 10, "Predecessors": [2],            "Resource": "Marketing / Design"},
    {"ID": 6,  "Task": "Phishing-Simulations-Setup",                           "Duration": 5,  "Predecessors": [2],            "Resource": "IT + Dienstleister"},
    {"ID": 7,  "Task": "Technische Plattform konfigurieren & testen",          "Duration": 10, "Predecessors": [4, 6],         "Resource": "IT"},
    {"ID": 8,  "Task": "Pilot-Schulung",                                       "Duration": 5,  "Predecessors": [3, 4, 5, 7],   "Resource": "Trainer*in"},
    {"ID": 9,  "Task": "Feedback auswerten & Inhalte optimieren",              "Duration": 5,  "Predecessors": [8],            "Resource": "IT & Trainer"},
    {"ID": 10, "Task": "Roll-out Präsenzschulungen",                           "Duration": 15, "Predecessors": [9],            "Resource": "Trainer*in"},
    {"ID": 11, "Task": "E-Learning Live-Schaltung",                            "Duration": 1,  "Predecessors": [7, 9],         "Resource": "IT"},
    {"ID": 12, "Task": "Phishing-Kampagne – Wave 1",                           "Duration": 1,  "Predecessors": [7],            "Resource": "IT + Dienstleister"},
    {"ID": 13, "Task": "Abschlussauswertung & Management-Report",              "Duration": 5,  "Predecessors": [10, 11, 12],   "Resource": "IT-Leitung"},
]

PROJECT_START = datetime(2025, 6, 16)   # Basisdatum (kannst du anpassen)

# ----------------------------------------------------------------------
# 2) Automatische Terminplanung (Vorwärtsrechnung)
# ----------------------------------------------------------------------
schedule = []
for task in TASKS:
    # Start = max(Finish aller Vorgänger) sonst 0
    if task["Predecessors"]:
        pred_finishes = [t["Finish"] for t in schedule if t["ID"] in task["Predecessors"]]
        start_offset = max(pred_finishes)
    else:
        start_offset = 0
    finish_offset = start_offset + task["Duration"]

    schedule.append({
        "ID":        task["ID"],
        "Task":      task["Task"],
        "Start":     start_offset,
        "Finish":    finish_offset,
        "Duration":  task["Duration"],
        "Resource":  task["Resource"],
        # Reale Datumswerte (optional – nice for tables)
        "StartDate": PROJECT_START + timedelta(days=start_offset),
        "EndDate":   PROJECT_START + timedelta(days=finish_offset),
    })

df = pd.DataFrame(schedule)

# ----------------------------------------------------------------------
# 3) Gantt zeichnen
# ----------------------------------------------------------------------
fig, ax = plt.subplots(figsize=(14, 7))
y_ticks, y_labels = [], []

for i, row in df.iterrows():
    ax.broken_barh(
        [(row["Start"], row["Duration"])],
        (i - 0.4, 0.8)                    # Position + Balkenhöhe
    )
    y_ticks.append(i)
    y_labels.append(f'{row["ID"]}  {row["Task"]}')

ax.set_yticks(y_ticks)
ax.set_yticklabels(y_labels)
ax.set_xlabel("Tage seit Projektstart")
ax.set_title("Gantt-Diagramm – Schulungskonzept TechGadgets")
ax.grid(axis="x", linestyle="--", alpha=0.3)
plt.tight_layout()

# ▶️  zeigt das Diagramm an
plt.show()

# ----------------------------------------------------------------------
# 4) (Optional) Tabelle ausgeben
# ----------------------------------------------------------------------
print(df[["ID", "Task", "StartDate", "EndDate", "Duration"]].to_string(index=False))
