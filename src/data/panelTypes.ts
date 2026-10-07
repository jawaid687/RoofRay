import { PanelType } from '../types';

export const PANEL_TYPES: PanelType[] = [
  {
    id: 'panel-400w',
    name: 'Helios Residential 400W',
    wattage: 400,
    width: 1.13,
    length: 1.72,
    cost: 195,
    efficiencyPercent: 20.6,
    category: 'Residential',
    description: 'Standard monocrystalline PERC module. Excellent form factor for residential and tight rooftop layouts.',
  },
  {
    id: 'panel-450w',
    name: 'SolMax High-Output 450W',
    wattage: 450,
    width: 1.13,
    length: 1.76,
    cost: 235,
    efficiencyPercent: 21.8,
    category: 'Commercial',
    description: 'High-density bifacial N-type cell technology. Optimal balance between wattage density and structural footprint.',
  },
  {
    id: 'panel-550w',
    name: 'AeroVolt Commercial 550W',
    wattage: 550,
    width: 1.13,
    length: 2.28,
    cost: 295,
    efficiencyPercent: 22.4,
    category: 'High-Density',
    description: 'Large-format utility-grade photovoltaic module. Maximizes peak generation for expansive commercial flat roofs.',
  },
];
