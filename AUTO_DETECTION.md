# Détection Automatique des Entités

La Power Flow Card Plus intègre un système de **détection automatique intelligente** des entités pour faciliter la configuration initiale.

---

## 🎯 Comment ça fonctionne ?

Lorsque vous ajoutez la carte sans configuration (ou avec une configuration minimale), elle analyse automatiquement toutes vos entités Home Assistant et sélectionne les plus appropriées.

---

## 🔍 Systèmes Supportés

### ⚡ **Enphase (Prioritaire)**

La carte détecte automatiquement les systèmes Enphase et utilise les entités spécifiques :

#### **Détection Enphase**

Le système est identifié comme Enphase si des entités contenant `envoy_` ou `enphase_` sont trouvées.

#### **Entités Enphase Détectées**

| Composant              | Patterns Recherchés                                             | Exemple d'Entité                                              |
| ---------------------- | --------------------------------------------------------------- | ------------------------------------------------------------- |
| **Grid (Réseau)**      | `current_net_power_consumption`, `net_consumption`              | `sensor.envoy_122050042807_current_net_power_consumption`     |
| **Solar (Solaire)**    | `production_d_electricite_actuelle`, `current_power_production` | `sensor.envoy_122050042807_production_d_electricite_actuelle` |
| **Home (Maison)**      | `consommation_electrique_actuelle`, `current_power_consumption` | `sensor.envoy_122050042807_consommation_electrique_actuelle`  |
| **Battery (Batterie)** | `enphase_battery`, `iq_5p_puissance`, `iq_battery`              | `sensor.enphase_battery_iq_5p_puissance`                      |
| **Battery SOC**        | `iq_5p_etat_de_charge`, `enphase_battery.*state_of_charge`      | `sensor.enphase_battery_iq_5p_etat_de_charge`                 |

---

### 🔋 **Systèmes Standard (Fallback)**

Si aucun système Enphase n'est détecté, la carte utilise des patterns génériques :

#### **Patterns Génériques**

| Composant       | Mots-clés Recherchés                                                                         |
| --------------- | -------------------------------------------------------------------------------------------- |
| **Grid**        | `grid`, `utility`, `net`, `meter`                                                            |
| **Solar**       | `solar`, `pv`, `photovoltaic`, `inverter`, `production`                                      |
| **Battery**     | `battery`, `batterie`                                                                        |
| **Battery SOC** | `battery_percent`, `battery_level`, `state_of_charge`, `soc`, `percentage`, `etat_de_charge` |
| **Home**        | `home`, `house`, `consumption`, `consommation`, `maison`, `domicile`                         |

---

## 🚀 Utilisation

### **1. Configuration Automatique Complète**

Ajoutez simplement la carte sans aucune configuration :

```yaml
type: custom:power-flow-card-plus
```

La carte va automatiquement :

- ✅ Détecter votre système (Enphase ou standard)
- ✅ Trouver les bonnes entités
- ✅ Configurer les paramètres optimaux

### **2. Configuration Partielle**

Vous pouvez aussi ne spécifier que certaines entités et laisser la carte détecter les autres :

```yaml
type: custom:power-flow-card-plus
entities:
  solar:
    entity: sensor.mon_capteur_solaire_specifique
  # Grid, battery et home seront auto-détectés
```

### **3. Configuration Manuelle Complète**

Si vous préférez tout contrôler manuellement :

```yaml
type: custom:power-flow-card-plus
entities:
  grid:
    entity: sensor.mon_grid
  solar:
    entity: sensor.mon_solar
  battery:
    entity: sensor.ma_batterie
    state_of_charge: sensor.mon_soc
  home:
    entity: sensor.ma_maison
```

---

## 🎨 Configuration par Défaut

Lorsque la détection automatique s'active, elle applique ces paramètres :

```yaml
clickable_entities: true # Entités cliquables
display_zero_lines: true # Affiche les lignes à zéro
use_new_flow_rate_model: true # Nouveau modèle d'animation
w_decimals: 0 # Pas de décimales pour watts
kw_decimals: 1 # 1 décimale pour kilowatts
min_flow_rate: 0.75 # Vitesse minimale flux
max_flow_rate: 6 # Vitesse maximale flux
watt_threshold: 1000 # Seuil W → kW
```

---

## 🔧 Filtrage des Entités

### **Critères de Détection**

La carte recherche des entités qui correspondent aux critères suivants :

1. **Device Class = "power"** OU
2. **Entity ID contient** : `power`, `puissance`, `production`, `consommation` OU
3. **Friendly Name correspond** aux patterns de recherche

### **Priorité de Détection**

1. 🥇 **Enphase** : Si système Enphase détecté → patterns spécifiques
2. 🥈 **Standards** : Patterns génériques si Enphase non trouvé
3. 🥉 **Fallback** : Première entité correspondante trouvée

---

## 📊 Exemples de Détection

### **Exemple 1 : Système Enphase Complet**

**Entités Home Assistant :**

```
sensor.envoy_122050042807_current_net_power_consumption
sensor.envoy_122050042807_production_d_electricite_actuelle
sensor.envoy_122050042807_consommation_electrique_actuelle
sensor.enphase_battery_iq_5p_puissance
sensor.enphase_battery_iq_5p_etat_de_charge
```

**Détection automatique :**

```yaml
# Aucune config requise !
type: custom:power-flow-card-plus
```

**Résultat :**

- ✅ Grid : `sensor.envoy_122050042807_current_net_power_consumption`
- ✅ Solar : `sensor.envoy_122050042807_production_d_electricite_actuelle`
- ✅ Home : `sensor.envoy_122050042807_consommation_electrique_actuelle`
- ✅ Battery : `sensor.enphase_battery_iq_5p_puissance`
- ✅ Battery SOC : `sensor.enphase_battery_iq_5p_etat_de_charge`

---

### **Exemple 2 : Système Standard (Growatt, Solis, etc.)**

**Entités Home Assistant :**

```
sensor.growatt_grid_power
sensor.growatt_solar_power
sensor.growatt_battery_power
sensor.growatt_battery_soc
sensor.home_power_consumption
```

**Détection automatique :**

```yaml
type: custom:power-flow-card-plus
```

**Résultat :**

- ✅ Grid : `sensor.growatt_grid_power`
- ✅ Solar : `sensor.growatt_solar_power`
- ✅ Battery : `sensor.growatt_battery_power`
- ✅ Battery SOC : `sensor.growatt_battery_soc`
- ✅ Home : `sensor.home_power_consumption`

---

### **Exemple 3 : Mix Auto + Manuel**

**Cas d'usage :** Vous avez un capteur maison personnalisé mais voulez l'auto-détection pour le reste.

```yaml
type: custom:power-flow-card-plus
entities:
  home:
    entity: sensor.mon_capteur_maison_custom
    # Grid, solar, battery seront auto-détectés
```

---

## 🐛 Dépannage

### **Problème : Mauvaise Entité Détectée**

**Solution 1 : Spécifier manuellement**

```yaml
entities:
  grid:
    entity: sensor.la_bonne_entite
```

**Solution 2 : Renommer votre entité**

Ajoutez un mot-clé reconnu dans le nom de votre entité :

- Ajoutez `grid` pour réseau
- Ajoutez `solar` pour solaire
- Ajoutez `battery` pour batterie

### **Problème : Aucune Entité Détectée**

**Vérifications :**

1. **Device Class**

   ```yaml
   # Dans customize.yaml
   sensor.mon_capteur:
     device_class: power
   ```

2. **Unité de mesure**

   - Vérifiez que l'unité est `W` ou `kW`
   - Pour le SOC : `%`

3. **Nom de l'entité**
   - Ajoutez des mots-clés reconnus (`grid`, `solar`, `battery`, etc.)

### **Problème : Entités Enphase Non Détectées**

**Solution :** Vérifiez que vos entités contiennent bien `envoy_` ou `enphase_` dans leur ID.

Si vos entités ont été renommées :

```yaml
# Configuration manuelle requise
entities:
  grid:
    entity: sensor.mon_envoy_renomme
```

---

## 🧪 Tester la Détection

### **Méthode 1 : Outils de Développement**

1. Ouvrez **Outils de développement** → **États**
2. Recherchez `power` dans le filtre
3. Vérifiez que vos entités ont :
   - `device_class: power`
   - `unit_of_measurement: W` ou `kW`

### **Méthode 2 : Logs**

Activez les logs dans Home Assistant pour voir quelles entités sont détectées :

```yaml
# configuration.yaml
logger:
  logs:
    custom_components.power_flow_card_plus: debug
```

---

## 💡 Bonnes Pratiques

### **1. Nommage Cohérent**

Utilisez des noms explicites pour vos entités :

```
✅ sensor.solar_production_power
✅ sensor.grid_import_export
✅ sensor.battery_charge_power
✅ sensor.home_consumption_power

❌ sensor.sensor1
❌ sensor.power_data
❌ sensor.device_123
```

### **2. Device Class**

Configurez toujours le `device_class` :

```yaml
# customize.yaml
sensor.mon_capteur_solaire:
  device_class: power
  unit_of_measurement: W
```

### **3. Friendly Names**

Utilisez des friendly names clairs :

```yaml
sensor.envoy_production:
  friendly_name: "Solar Production Power"
```

---

## 📚 Références

- [Guide Configuration Enphase](./ENPHASE_CONFIG.md)
- [Documentation Power Flow Card Plus](https://github.com/flixlix/power-flow-card-plus)
- [Home Assistant Device Classes](https://www.home-assistant.io/integrations/sensor/#device-class)

---

## ✅ Résumé

| Fonctionnalité     | Support        |
| ------------------ | -------------- |
| Détection Enphase  | ✅ Oui         |
| Détection Standard | ✅ Oui         |
| Configuration Mix  | ✅ Oui         |
| Multi-langues      | ✅ Oui (FR/EN) |
| Fallback           | ✅ Oui         |

**La détection automatique vous fait gagner du temps tout en restant flexible !** 🚀
