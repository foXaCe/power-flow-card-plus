# Configuration Power Flow Card Plus pour Système Enphase

Ce guide explique comment configurer la **Power Flow Card Plus** avec un système Enphase comprenant :
- **Envoy** (passerelle de monitoring solaire)
- **Batterie Enphase IQ 5P**
- Gestion complète de la production, consommation et stockage

---

## 📋 Table des Matières

- [Entités Requises](#entités-requises)
- [Configuration de Base](#configuration-de-base)
- [Configuration Avancée](#configuration-avancée)
- [Explications Détaillées](#explications-détaillées)
- [Dépannage](#dépannage)
- [Entités Supplémentaires](#entités-supplémentaires)

---

## 🔌 Entités Requises

### **Panneaux Solaires (Envoy 122050042807)**

| Fonction | Entité | Description |
|----------|--------|-------------|
| **Production actuelle** | `sensor.envoy_122050042807_production_d_electricite_actuelle` | Puissance solaire instantanée (W) |
| **Consommation maison** | `sensor.envoy_122050042807_consommation_electrique_actuelle` | Consommation totale maison (W) |
| **Net Grid** | `sensor.envoy_122050042807_current_net_power_consumption` | Import (+) / Export (-) grid (W) |

### **Batterie (Enphase IQ 5P)**

| Fonction | Entité | Description |
|----------|--------|-------------|
| **État de charge** | `sensor.enphase_battery_iq_5p_etat_de_charge` | Niveau batterie (%) |
| **Puissance batterie** | `sensor.enphase_battery_iq_5p_puissance` | Charge (+) / Décharge (-) (W) |
| **Puissance charge** | `sensor.enphase_battery_iq_5p_puissance_de_charge` | Puissance de charge (W) |
| **Puissance décharge** | `sensor.enphase_battery_iq_5p_puissance_de_decharge` | Puissance de décharge (W) |
| **Énergie disponible** | `sensor.enphase_battery_iq_5p_energie_disponible_de_la_batterie` | Capacité disponible (Wh) |

---

## ⚡ Configuration de Base

### Configuration YAML Minimale

```yaml
type: custom:power-flow-card-plus
entities:
  # Réseau électrique (Grid)
  grid:
    entity: sensor.envoy_122050042807_current_net_power_consumption
    # Valeur positive = import du réseau
    # Valeur négative = export vers le réseau

  # Panneaux solaires
  solar:
    entity: sensor.envoy_122050042807_production_d_electricite_actuelle

  # Batterie
  battery:
    entity: sensor.enphase_battery_iq_5p_puissance
    state_of_charge: sensor.enphase_battery_iq_5p_etat_de_charge
    # Puissance positive = charge
    # Puissance négative = décharge

  # Consommation maison (calculée automatiquement)
  home:
    entity: sensor.envoy_122050042807_consommation_electrique_actuelle
```

---

## 🎨 Configuration Avancée

### Configuration Complète avec Informations Secondaires

```yaml
type: custom:power-flow-card-plus

# Configuration des couleurs personnalisées
custom_colors:
  solar_color: "#ff9800"      # Orange pour solaire
  grid_color: "#0288d1"        # Bleu pour réseau
  battery_color: "#4caf50"     # Vert pour batterie
  home_color: "#f44336"        # Rouge pour consommation

entities:
  # === RÉSEAU ÉLECTRIQUE ===
  grid:
    entity: sensor.envoy_122050042807_current_net_power_consumption
    name: "Réseau"
    icon: "mdi:transmission-tower"
    color_icon: true
    display_state: two_way

    # Informations secondaires
    secondary_info:
      entity: sensor.envoy_122050042807_consommation_d_energie_du_jour
      unit_of_measurement: "kWh"
      decimals: 2
      display_zero: true

  # === PANNEAUX SOLAIRES ===
  solar:
    entity: sensor.envoy_122050042807_production_d_electricite_actuelle
    name: "Solaire"
    icon: "mdi:solar-power"
    color_icon: true
    display_zero: false

    # Informations secondaires - Production du jour
    secondary_info:
      entity: sensor.envoy_122050042807_production_d_energie_du_jour
      unit_of_measurement: "kWh"
      decimals: 2
      icon: "mdi:solar-panel"

  # === BATTERIE ===
  battery:
    entity: sensor.enphase_battery_iq_5p_puissance
    state_of_charge: sensor.enphase_battery_iq_5p_etat_de_charge
    name: "Batterie IQ 5P"
    icon: "mdi:battery-high"
    color_icon: true
    color_state_of_charge_value: true

    # Configuration état de charge
    show_state_of_charge: true
    state_of_charge_decimals: 0
    state_of_charge_unit: "%"

    # Informations secondaires - Temps de backup
    secondary_info:
      entity: sensor.enphase_battery_iq_5p_temps_de_backup_estime
      icon: "mdi:clock-outline"
      display_zero: true

  # === CONSOMMATION MAISON ===
  home:
    entity: sensor.envoy_122050042807_consommation_electrique_actuelle
    name: "Maison"
    icon: "mdi:home"
    color_icon: false
    subtract_individual: true

    # Informations secondaires - Consommation du jour
    secondary_info:
      entity: sensor.envoy_122050042807_consommation_d_energie_du_jour
      unit_of_measurement: "kWh"
      decimals: 2

# Configuration globale
w_decimals: 0
kw_decimals: 2
watt_threshold: 1000
display_zero_lines:
  mode: "transparency"
  transparency: 50
clickable_entities: true
use_new_flow_rate_model: true
min_flow_rate: 0.75
max_flow_rate: 6
```

---

## 🔧 Configuration avec Appareils Individuels

Si vous souhaitez afficher des appareils spécifiques (voiture électrique, pompe à chaleur, etc.) :

```yaml
type: custom:power-flow-card-plus

entities:
  grid:
    entity: sensor.envoy_122050042807_current_net_power_consumption
  solar:
    entity: sensor.envoy_122050042807_production_d_electricite_actuelle
  battery:
    entity: sensor.enphase_battery_iq_5p_puissance
    state_of_charge: sensor.enphase_battery_iq_5p_etat_de_charge
  home:
    entity: sensor.envoy_122050042807_consommation_electrique_actuelle
    subtract_individual: true

  # Appareils individuels
  individual:
    - entity: sensor.voiture_electrique_puissance
      name: "Voiture"
      icon: "mdi:car-electric"
      color: "#2196f3"
      display_zero: false
      decimals: 1

    - entity: sensor.pompe_chaleur_puissance
      name: "Pompe à Chaleur"
      icon: "mdi:heat-pump"
      color: "#ff5722"
      display_zero: false
      decimals: 1
```

---

## 📖 Explications Détaillées

### **1. Entité Grid (Réseau)**

L'Envoy fournit `current_net_power_consumption` qui représente :
- **Valeur positive** : Vous importez de l'électricité du réseau
- **Valeur négative** : Vous exportez de l'électricité vers le réseau

La carte gère automatiquement cette logique bidirectionnelle.

### **2. Entité Battery (Batterie)**

La batterie Enphase IQ 5P fournit plusieurs capteurs :
- **`puissance`** : Flux bidirectionnel (+charge / -décharge)
- **`puissance_de_charge`** : Uniquement quand elle charge
- **`puissance_de_decharge`** : Uniquement quand elle décharge

**Recommandation** : Utilisez `sensor.enphase_battery_iq_5p_puissance` car il contient déjà la direction du flux.

### **3. État de Charge (State of Charge)**

```yaml
battery:
  state_of_charge: sensor.enphase_battery_iq_5p_etat_de_charge
  show_state_of_charge: true
  state_of_charge_decimals: 0
```

Affiche le pourcentage de charge de la batterie au centre du cercle.

### **4. Subtract Individual**

Si vous ajoutez des appareils individuels, activez `subtract_individual: true` sur l'entité `home` :

```yaml
home:
  subtract_individual: true
```

Cela soustraira la consommation des appareils individuels de la consommation totale affichée.

---

## 🎯 Cas d'Usage Spécifiques

### **Scénario 1 : Journée ensoleillée**
- Solaire produit **5000 W**
- Consommation maison **2000 W**
- Batterie charge **2000 W**
- Export grid **1000 W**

**Flux affichés :**
- Solar → Home : 2000 W
- Solar → Battery : 2000 W
- Solar → Grid : 1000 W

### **Scénario 2 : Nuit avec batterie**
- Solaire produit **0 W**
- Consommation maison **1500 W**
- Batterie décharge **1000 W**
- Import grid **500 W**

**Flux affichés :**
- Battery → Home : 1000 W
- Grid → Home : 500 W

### **Scénario 3 : Charge batterie depuis grid (nuit creuse)**
- Solaire produit **0 W**
- Consommation maison **500 W**
- Batterie charge **2000 W**
- Import grid **2500 W**

**Flux affichés :**
- Grid → Home : 500 W
- Grid → Battery : 2000 W

---

## 🐛 Dépannage

### **Problème : Les flux ne s'affichent pas correctement**

**Solution 1 : Vérifier les valeurs des entités**

Allez dans **Outils de développement → États** et vérifiez :
- Les entités existent et ont des valeurs
- Les unités sont en **W** (watts) ou **kW** (kilowatts)
- Les valeurs sont numériques (pas de texte)

**Solution 2 : Vérifier les signes**

Pour l'entité Grid :
```yaml
# Si votre grid affiche import en négatif et export en positif (inversé)
grid:
  entity: sensor.envoy_122050042807_current_net_power_consumption
  invert_state: true  # Inverse les signes
```

Pour la batterie :
```yaml
# Si charge/décharge sont inversées
battery:
  entity: sensor.enphase_battery_iq_5p_puissance
  inverted_animation: true
```

### **Problème : La batterie ne montre pas de flux**

Vérifiez que vous utilisez la bonne entité :
```yaml
battery:
  entity: sensor.enphase_battery_iq_5p_puissance
  # ET NON :
  # entity: sensor.enphase_battery_iq_5p_puissance_de_charge
```

### **Problème : Les valeurs sont en kWh au lieu de W**

Si vos capteurs sont en énergie (kWh) et non en puissance (W), vous devez créer des template sensors.

**Exemple de template sensor pour convertir kWh/h en W :**

```yaml
# Dans configuration.yaml
template:
  - sensor:
      - name: "Solar Power"
        unit_of_measurement: "W"
        device_class: power
        state: >
          {{ (states('sensor.envoy_production_energie') | float(0) * 1000) | round(0) }}
```

---

## 📊 Entités Supplémentaires Disponibles

### **Statistiques Journalières**

| Donnée | Entité |
|--------|--------|
| Production du jour | `sensor.envoy_122050042807_production_d_energie_du_jour` |
| Consommation du jour | `sensor.envoy_122050042807_consommation_d_energie_du_jour` |
| Énergie chargée | `sensor.enphase_battery_iq_5p_energie_chargee_aujourd_hui` |
| Énergie déchargée | `sensor.enphase_battery_iq_5p_energie_dechargee_aujourd_hui` |

### **Statistiques Totales**

| Donnée | Entité |
|--------|--------|
| Production totale | `sensor.envoy_122050042807_production_d_energie_totale` |
| Consommation totale | `sensor.envoy_122050042807_consommation_d_energie_totale` |
| Net production lifetime | `sensor.envoy_122050042807_lifetime_net_energy_production` |
| Net consumption lifetime | `sensor.envoy_122050042807_lifetime_net_energy_consumption` |

### **Statistiques Batterie**

| Donnée | Entité |
|--------|--------|
| État batterie | `sensor.enphase_battery_iq_5p_etat_batterie` |
| Énergie disponible | `sensor.enphase_battery_iq_5p_energie_disponible_de_la_batterie` |
| Temps backup estimé | `sensor.enphase_battery_iq_5p_temps_de_backup_estime` |

---

## 💡 Conseils & Astuces

### **1. Utiliser les Secondary Info**

Affichez des informations complémentaires sous chaque cercle :

```yaml
solar:
  secondary_info:
    entity: sensor.envoy_122050042807_production_d_energie_du_jour
    unit_of_measurement: "kWh"
    decimals: 2
```

### **2. Liens vers Dashboards**

Ajoutez des liens cliquables :

```yaml
battery:
  tap_action:
    action: navigate
    navigation_path: /lovelace/energie
```

### **3. Animation Fluide**

Pour des animations plus douces :

```yaml
use_new_flow_rate_model: true
min_flow_rate: 0.75
max_flow_rate: 6
min_expected_power: 0
max_expected_power: 10000  # Ajustez selon votre installation
```

### **4. Affichage Conditionnel**

Masquez les lignes à zéro :

```yaml
display_zero_lines:
  mode: "hide"
```

Ou rendez-les semi-transparentes :

```yaml
display_zero_lines:
  mode: "transparency"
  transparency: 50
```

---

## 🔗 Liens Utiles

- [Documentation Power Flow Card Plus](https://github.com/flixlix/power-flow-card-plus)
- [Intégration Enphase Home Assistant](https://www.home-assistant.io/integrations/enphase_envoy/)
- [Forum Communauté HA - Enphase](https://community.home-assistant.io/tag/enphase)

---

## 📝 Template de Configuration à Copier/Coller

```yaml
type: custom:power-flow-card-plus
entities:
  grid:
    entity: sensor.envoy_122050042807_current_net_power_consumption
  solar:
    entity: sensor.envoy_122050042807_production_d_electricite_actuelle
  battery:
    entity: sensor.enphase_battery_iq_5p_puissance
    state_of_charge: sensor.enphase_battery_iq_5p_etat_de_charge
  home:
    entity: sensor.envoy_122050042807_consommation_electrique_actuelle
```

**Copiez ce code dans votre dashboard Lovelace et ajustez selon vos besoins !**

---

## ✅ Checklist d'Installation

- [ ] Power Flow Card Plus installée via HACS
- [ ] Intégration Enphase configurée dans Home Assistant
- [ ] Toutes les entités disponibles et fonctionnelles
- [ ] Configuration YAML copiée et adaptée
- [ ] Carte ajoutée au dashboard
- [ ] Flux de puissance affichés correctement
- [ ] Animations fluides et logiques

---

**Besoin d'aide ?** Ouvrez une issue sur le [dépôt GitHub](https://github.com/foXaCe/power-flow-card-plus/issues) ! 🚀
