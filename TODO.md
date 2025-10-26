# TODO - Power Flow Card Plus

## Version Actuelle: 0.13.1

### Travail Accompli

#### Layout et Positionnement
- ✅ Migration complète de flexbox vers position:absolute
- ✅ Suppression de tous les .row et structures flexbox
- ✅ Positions par défaut définies pour tous les cercles (solar, grid, home, battery)
- ✅ Support des custom_positions

#### Drag & Drop
- ✅ Mode édition avec bouton toggle
- ✅ Drag & drop fonctionnel pour tous les cercles (mousedown/touchstart)
- ✅ Sauvegarde des positions dans custom_positions
- ✅ Deep clone du config pour éviter "object not extensible"

#### Lignes Dynamiques (2/6 completées)
- ✅ Nouvelle fonction `calculateCirclePosition()` - Calcule les positions réelles des cercles (defaults + custom)
- ✅ Nouvelle fonction `calculateLinePath()` - Génère les chemins SVG dynamiquement
- ✅ Ancrage correct des lignes au bord des cercles (40px du centre)
- ✅ **flowSolarToBattery** - Ligne dynamique entre solar et battery
- ✅ **flowGridToHome** - Ligne dynamique entre grid et home

---

## Ce qui Reste à Faire - Version 0.14.0

### 1. Compléter les Lignes Dynamiques (4/6 restants)

Les flux suivants utilisent encore des chemins SVG fixes avec des courbes Bézier. Il faut les convertir en lignes dynamiques:

#### À Convertir:

**a) flowSolarToGrid** (`src/components/flows/solarToGrid.ts`)
- Chemin actuel: `M45,0 v15 c0,30 -10,30 -30,30 h-20` (courbe de solar vers grid)
- Action: Utiliser `calculateCirclePosition('solar')` et `calculateCirclePosition('grid')`
- Décision: Ligne droite ou courbe? Si courbe, implémenter calcul de courbe dynamique

**b) flowSolarToHome** (`src/components/flows/solarToHome.ts`)
- Chemin actuel: `M55,0 v15 c0,30 10,30 30,30 h25` (courbe de solar vers home)
- Action: Utiliser `calculateCirclePosition('solar')` et `calculateCirclePosition('home')`
- Même décision: droite ou courbe?

**c) flowBatteryToHome** (`src/components/flows/batteryToHome.ts`)
- Chemin actuel: `M55,100 v-15 c0,-30 10,-30 30,-30 h20` (courbe de battery vers home)
- Action: Utiliser `calculateCirclePosition('battery')` et `calculateCirclePosition('home')`

**d) flowBatteryGrid** (`src/components/flows/batteryGrid.ts`)
- Chemin actuel: `M45,100 v-15 c0,-30 -10,-30 -30,-30 h-20` (courbe de battery vers grid)
- Action: Utiliser `calculateCirclePosition('battery')` et `calculateCirclePosition('grid')`
- Note: Ce flux est bidirectionnel (grid→battery et battery→grid)

### 2. Décision Architecturale: Courbes vs Lignes Droites

**Option A: Lignes Droites** (Plus simple)
- Utiliser `calculateLinePath(from, to, 'straight')` pour tous
- Avantage: Simple, toujours correct quelle que soit la position
- Inconvénient: Moins esthétique que les courbes

**Option B: Courbes Dynamiques** (Plus complexe)
- Implémenter une fonction de calcul de courbe Bézier dynamique
- Adapter les points de contrôle selon les positions des cercles
- Avantage: Plus esthétique
- Inconvénient: Complexe, peut ne pas toujours bien fonctionner

**Suggestion**: Commencer par option A (lignes droites), puis améliorer avec courbes si nécessaire.

### 3. Éléments Non Encore Migrés

Les éléments suivants n'ont PAS été inclus dans le nouveau layout absolu:

**a) Individual Devices**
- Cercles: `individual[0]`, `individual[1]`, `individual[2]`, `individual[3]`
- Positions: left-top, left-bottom, right-top, right-bottom
- Fichier: Chercher dans le code pour "individual"
- Action: Ajouter positions par défaut dans CSS et support drag & drop

**b) NonFossil Element**
- N'apparaît plus dans le render simplifié
- Action: Vérifier s'il faut le réintégrer

**c) Daily Export / Daily Cost**
- Ces éléments ont été supprimés dans les versions précédentes (0.11.7-0.11.8)
- Action: Vérifier qu'ils ne sont plus nécessaires

### 4. Autres Améliorations Possibles

**a) Validation du Layout**
- Vérifier que tous les cercles restent dans les limites de la carte (0-400px)
- Ajouter des contraintes au drag & drop

**b) Animation des Lignes**
- Les dots animés (animateMotion) fonctionnent-ils bien avec les nouveaux chemins?
- Tester avec différentes configurations

**c) Performance**
- Les calculs de position sont-ils optimisés?
- Utiliser memoization si nécessaire

**d) CSS Z-Index**
- Vérifier que les lignes (z-index: 0) restent derrière les cercles
- Vérifier que le bouton d'édition est toujours accessible

---

## Fichiers Clés à Connaître

### Layout et Style
- `src/style.ts` - CSS principal avec positions absolues
- `src/power-flow-card-plus.ts` - Composant principal, render() simplifié, drag & drop

### Composants Cercles
- `src/components/solar.ts` - Cercle solaire
- `src/components/grid.ts` - Cercle réseau
- `src/components/home.ts` - Cercle maison
- `src/components/battery.ts` - Cercle batterie

### Flux (Lignes)
- `src/components/flows/index.ts` - Export de tous les flux
- `src/components/flows/solarToBattery.ts` - ✅ FAIT
- `src/components/flows/gridToHome.ts` - ✅ FAIT
- `src/components/flows/solarToGrid.ts` - ❌ À FAIRE
- `src/components/flows/solarToHome.ts` - ❌ À FAIRE
- `src/components/flows/batteryToHome.ts` - ❌ À FAIRE
- `src/components/flows/batteryGrid.ts` - ❌ À FAIRE

### Utilitaires
- `src/utils/calculateCirclePosition.ts` - **NOUVEAU** Calcul positions et chemins

---

## Structure du Drag & Drop

### État
```typescript
@state() private _editMode = false;
@state() private _draggedElement: string | null = null;
```

### Méthodes Clés
- `_toggleEditMode()` - Active/désactive le mode édition
- `_onDragStart(e, element)` - Démarre le drag
- `_onDragMove(e)` - Déplace l'élément
- `_onDragEnd()` - Termine le drag
- `_saveConfig()` - Sauvegarde dans Home Assistant

### Bouton d'Édition
```html
<button class="edit-mode-toggle" @click=${this._toggleEditMode}>
  ${this._editMode ? '✓ Terminer' : '✏️ Éditer'}
</button>
```

---

## Notes Importantes

### Deep Clone Obligatoire
Home Assistant freeze/seal le config object. Il FAUT utiliser:
```typescript
const newConfig = JSON.parse(JSON.stringify(this._config));
```
Sinon erreur: "Cannot add property X, object is not extensible"

### Positions CSS
Les positions custom utilisent `!important` pour override les defaults:
```typescript
style="${config.custom_positions?.grid
  ? `top: ${config.custom_positions.grid.top}px !important;`
  : ""}"
```

### Carte Dimensions
- Width: 400px
- Height: 400px
- Rayon cercle: 40px (diamètre 80px)

---

## Prochaines Étapes Recommandées

1. **Convertir flowSolarToGrid en ligne dynamique droite**
2. **Convertir flowSolarToHome en ligne dynamique droite**
3. **Convertir flowBatteryToHome en ligne dynamique droite**
4. **Convertir flowBatteryGrid en ligne dynamique droite**
5. **Tester le drag & drop avec toutes les lignes dynamiques**
6. **Vérifier les individual devices**
7. **Décider si courbes Bézier nécessaires**
8. **Release 0.14.0**

---

## Historique des Versions

- **0.13.1** (actuelle) - Correction ancrage des lignes au bord des cercles
- **0.13.0** - Nouveau layout absolu + 2 lignes dynamiques (solar-battery, grid-home)
- **0.12.2** - Fix drag & drop config immutability
- **0.12.0** - Première implémentation drag & drop
- **0.11.12** - Fix gradient mode background
- **0.11.7-0.11.8** - Suppression des flèches daily-cost et daily-export
