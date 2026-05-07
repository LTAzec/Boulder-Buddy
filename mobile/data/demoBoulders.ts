// data/demoBoulders.ts
import type {
  BoulderGrade,
  BoulderColor,
  AscentStatus,
} from '@/types/bouldering';

// Eén demo-boulder/log die we in zowel Logbook als Wall kunnen gebruiken
export type DemoBoulder = {
  id: string;
  name: string;          // naam van de boulder
  grade: BoulderGrade;
  color: BoulderColor;
  sectorId: string;      // voor Wall: slab-links / overhang / middle
  status: AscentStatus;  // voor Logbook
  attempts?: number;      // voor Logbook
};

// Hier gebruik je de 3 boulder die je in Logbook al had
export const demoBoulders: DemoBoulder[] = [
  {
    id: '1',
    name: 'Groene slab links',
    grade: '6A',
    color: 'green',
    sectorId: 'slab-links',
    status: 'project',
    attempts: 3,
  },
  {
    id: '2',
    name: 'Rode overhang rechts',
    grade: '6B',
    color: 'red',
    sectorId: 'overhang',
    status: 'sent',
    attempts: 5,
  },
  {
    id: '3',
    name: 'Blauwe dyno midden',
    grade: '7A',
    color: 'blue',
    sectorId: 'middle',
    status: 'flash',
    attempts: 1,
  },
];
