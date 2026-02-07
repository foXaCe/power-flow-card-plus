# Power Flow Card Plus - Modern Edition

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg?style=flat-square)](https://github.com/hacs/integration)
![GitHub release (latest by date)](https://img.shields.io/github/v/release/foXaCe/power-flow-card-plus?style=flat-square)

![Power Flow Card Plus Demo](https://user-images.githubusercontent.com/61006057/227771568-78497ecc-e863-46f2-b29e-e15c7c20a154.gif)

## 🌟 About This Project

This is a **modernized and enhanced fork** of the original [Power Flow Card Plus](https://github.com/flixlix/power-flow-card-plus) by **flixlix**.

### Why This Fork?

The original Power Flow Card Plus is an excellent project, but needed updates to work with the latest Home Assistant versions and modern web standards. This fork brings:

- ✅ **Updated for latest Home Assistant** - Full compatibility with recent HA versions
- ✅ **Modern codebase** - Updated dependencies and improved performance
- ✅ **New features** - Arrow customization, custom positioning, daily cost/export tracking
- ✅ **Enhanced editor** - Wider modal, better UX, visual editors for positioning and flows
- ✅ **Bug fixes** - Resolved issues with infinite re-renders and validation errors
- ✅ **Continued development** - Active maintenance and feature additions

**🙏 Big thanks to [flixlix](https://github.com/flixlix) for creating the original Power Flow Card Plus!** This modernized version builds upon their excellent work.

---

## 💰 Support the Project

If this integration is useful to you, you can support its development with a Bitcoin donation:

**🪙 Bitcoin Address:** `bc1qhe4ge22x0anuyeg0fmts6rdmz3t735dnqwt3p7`

Your contributions help me continue improving this project and adding new features. Thank you! 🙏

## ✨ New Features in Modern Edition

### 🎨 Arrow Customization (v0.10.0+)

Customize the appearance and position of energy flow arrows:

- **Color** - Any hex color for each arrow
- **Thickness** - Line width from 0.5 to 10px
- **Horizontal/Vertical Offset** - Position adjustment (-200 to +200px)

Currently available for:

- Solar → Home
- Grid → Home
- Solar → Daily Export

### 📍 Custom Circle Positioning (v0.8.0+)

Move any circle to a custom position on the card:

- Manual positioning with pixel precision
- Reset buttons to restore defaults
- Visual position editor with current values

### 💰 Daily Cost & Export Tracking (v0.7.0+)

- **Daily Cost** - Track daily energy costs with real-time tariff integration
- **Daily Export Revenue** - Monitor earnings from grid export
- Configurable decimal places and units

### 🖱️ Enhanced Editor (v0.10.1+)

- **Wider modal** - 90% viewport width (max 1200px)
- **Real-size preview** - See the card as it appears on dashboard
- **Dedicated editors** - Separate pages for positioning, flows, and arrows

---

## 📦 Installation

### HACS (Manual)

1. Open HACS
2. Go to "Frontend"
3. Click the 3 dots in the top right
4. Select "Custom repositories"
5. Add `https://github.com/foXaCe/power-flow-card-plus` with category "Dashboard"
6. Click "Install"

### Manual Install

1. Download `power-flow-card-plus.js` from the [latest release](https://github.com/foXaCe/power-flow-card-plus/releases/latest)
2. Copy it to your `config/www` directory
3. Add the resource reference:

```yaml
resources:
  - url: /local/power-flow-card-plus.js
    type: module
```

Or via UI:

1. Settings → Dashboards → Resources
2. Add resource: `/local/power-flow-card-plus.js` (type: JavaScript Module)

---

## 🚀 Quick Start

### Minimal Configuration

```yaml
type: custom:power-flow-card-plus
entities:
  grid:
    entity: sensor.grid_power
  solar:
    entity: sensor.solar_production
  battery:
    entity: sensor.battery_power
    state_of_charge: sensor.battery_soc
```

### Full Example with New Features

```yaml
type: custom:power-flow-card-plus
entities:
  grid:
    entity:
      consumption: sensor.grid_consumption
      production: sensor.grid_production
    display_state: one_way
    color_circle: true
  solar:
    entity: sensor.solar_production
  battery:
    entity:
      consumption: sensor.battery_consumption
      production: sensor.battery_production
    state_of_charge: sensor.battery_soc
    display_state: one_way
  home:
    entity: sensor.home_consumption

# Daily Cost Tracking
show_daily_cost: true
daily_cost_energy_entity: sensor.daily_import
cost_entity: sensor.electricity_tariff
cost_decimals: 2

# Daily Export Revenue
show_daily_export: true
daily_export_energy_entity: sensor.daily_export
daily_export_price: 0.11
daily_export_decimals: 2

# Custom Circle Positions
custom_positions:
  solar:
    top: 10
    left: 50
  grid:
    top: 10
    left: -50

# Arrow Customization
arrows:
  solar_to_home:
    color: "#FFA500"
    thickness: 3
    offset_x: 10
  grid_to_home:
    color: "#4285F4"
    thickness: 2.5

# General Settings
watt_threshold: 1000
kw_decimals: 2
w_decimals: 0
clickable_entities: true
```

---

## 🎯 Core Features

All original Power Flow Card Plus features are included:

- 🎨 **UI Editor** - Visual configuration without YAML
- 🌍 **Multi-language** - 17 languages supported
- ↕️ **Bidirectional Flows** - Individual entities with both consumption/production
- ℹ️ **Secondary Information** - Additional info for all circles
- ⚡ **Power Outage Display** - Visual indication of grid outages
- 📙 **Template Support** - Use Home Assistant templates
- 🎨 **Extensive Customization** - Colors, icons, labels, and more

---

## 📖 Configuration

### Entities Object

| Name                     | Type   | Description                                  |
| ------------------------ | ------ | -------------------------------------------- |
| `grid`                   | object | Grid consumption/production entity           |
| `solar`                  | object | Solar production entity                      |
| `battery`                | object | Battery charge/discharge and state of charge |
| `home`                   | object | Home consumption entity                      |
| `individual`             | array  | Individual device entities (up to 4)         |
| `fossil_fuel_percentage` | object | Low-carbon energy percentage                 |

### Card Options

| Name                     | Type    | Default | Description                       |
| ------------------------ | ------- | ------- | --------------------------------- |
| `watt_threshold`         | number  | 0       | Watts before converting to kW     |
| `kw_decimals`            | number  | 1       | Decimal places for kW             |
| `w_decimals`             | number  | 1       | Decimal places for W              |
| `min_flow_rate`          | number  | 0.75    | Fastest dot speed (seconds)       |
| `max_flow_rate`          | number  | 6       | Slowest dot speed (seconds)       |
| `clickable_entities`     | boolean | false   | Click entities to open more-info  |
| `disable_dots`           | boolean | false   | Hide animated dots                |
| `circle_border_width`    | number  | 2       | Circle border thickness (1-10px)  |
| `circle_pulse_animation` | boolean | false   | Animate circles when energy flows |
| `circle_gradient_mode`   | boolean | false   | Use gradient colors for circles   |

### Arrow Customization

```yaml
arrows:
  solar_to_home:
    color: "#FFA500"
    thickness: 2.5
    offset_x: 10
    offset_y: -5
  grid_to_home:
    color: "#4285F4"
    thickness: 3
```

### Custom Positions

```yaml
custom_positions:
  solar:
    top: 20 # pixels from default position
    left: 50
  grid:
    top: -10
    left: -30
  battery:
    top: 15
    left: 0
```

### Daily Cost & Export

```yaml
# Daily Cost
show_daily_cost: true
daily_cost_energy_entity: sensor.daily_energy_import
cost_entity: sensor.current_tariff
cost_unit: "€/kWh"
cost_decimals: 2

# Daily Export Revenue
show_daily_export: true
daily_export_energy_entity: sensor.daily_energy_export
daily_export_price: 0.11
daily_export_decimals: 2
```

---

## 🎨 Visual Editor

Use the built-in visual editors for easy configuration:

### Position Editor

1. Open card editor
2. Click "Custom Positions"
3. Enter pixel values or use reset buttons
4. See default positions as reference

### Flows & Appearance Editor

1. Open card editor
2. Click "Flows & Appearance"
3. Adjust animation speed, circle appearance, and display options
4. Customize individual arrows (color, thickness, position)

---

## 🌍 Supported Languages

🇺🇸 English • 🇩🇪 German • 🇫🇷 French • 🇪🇸 Spanish • 🇮🇹 Italian • 🇳🇱 Dutch • 🇵🇹 Portuguese (PT) • 🇧🇷 Portuguese (BR) • 🇵🇱 Polish • 🇷🇺 Russian • 🇫🇮 Finnish • 🇩🇰 Danish • 🇨🇿 Czech • 🇸🇰 Slovak • 🇸🇪 Swedish • 🇺🇦 Ukrainian • 🇮🇳 Hindi

---

## 🗑️ Removal

### HACS

1. Open HACS
2. Go to "Frontend"
3. Find "Power Flow Card Plus" in the list
4. Click the 3 dots and select "Remove"
5. Restart Home Assistant

### Manual

1. Remove `power-flow-card-plus.js` from your `config/www` directory
2. Remove the resource reference from Settings > Dashboards > Resources
3. Restart Home Assistant

---

## ⚠️ Known Limitations

- **Maximum 4 individual devices** - The card supports up to 4 individual device entities
- **Power values only** - The card displays instantaneous power (W/kW), not accumulated energy (kWh). For energy values, see [Energy Flow Card Plus](https://github.com/flixlix/energy-flow-card-plus)
- **Custom positions persist in localStorage** - Position data is stored in the browser; clearing browser data resets custom positions
- **Arrow customization partial** - Currently 3 of 7 possible arrow paths are customizable (solar-to-home, grid-to-home, solar-to-export)

---

## 🔧 Troubleshooting

| Problem                         | Solution                                                                                                        |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Card not showing                | Verify the resource is added in Settings > Dashboards > Resources                                               |
| "Custom element doesn't exist"  | Clear browser cache and reload. Ensure the JS file is in `config/www/`                                          |
| Values showing 0                | Check that your entity IDs are correct and the entities have a `unit_of_measurement` attribute                  |
| Animations not working          | Ensure `disable_dots` is not set to `true` in your configuration                                                |
| Editor not opening              | Try clearing browser cache. If using HACS, ensure the latest version is installed                               |
| Daily cost showing wrong values | Verify `cost_entity` returns a numeric price per kWh and `daily_cost_energy_entity` returns daily energy in kWh |

---

## 📝 Changelog

See [Releases](https://github.com/foXaCe/power-flow-card-plus/releases) for detailed changelog.

### Recent Versions

- **v0.10.1** - Expanded editor modal for real-size preview
- **v0.10.0** - Arrow customization (3/7 arrows)
- **v0.9.4** - Fixed schema validation for arrows
- **v0.9.0** - Flows & appearance editor
- **v0.8.5** - Custom position editor fixes
- **v0.8.0** - Custom circle positioning

---

## 🤝 Contributing

Contributions are welcome! This is a community-driven modernization effort.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details

---

## 🙏 Credits

**Original Author:** [flixlix](https://github.com/flixlix) - Created the excellent Power Flow Card Plus that this fork is based on.

**Modern Edition:** Maintained and enhanced for compatibility with latest Home Assistant versions and modern web standards.

---

## 💬 Support & Issues

- **Issues:** [GitHub Issues](https://github.com/foXaCe/power-flow-card-plus/issues)
- **Discussions:** Use GitHub Discussions for questions and feature requests

---

## 🔗 Related Projects

- [Original Power Flow Card Plus](https://github.com/flixlix/power-flow-card-plus) by flixlix
- [Energy Flow Card Plus](https://github.com/flixlix/energy-flow-card-plus) - For accumulated energy values
- [Home Assistant Energy Dashboard](https://www.home-assistant.io/docs/energy/) - Built-in energy management

---

**Made with ❤️ for the Home Assistant community**
