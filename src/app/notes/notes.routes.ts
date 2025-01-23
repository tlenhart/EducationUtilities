import { Routes } from '@angular/router';

export const notesRoutes: Routes = [
  {
    path: 'notes',
    title: 'Notes',
    data: {
      icon: 'sticky_note',
    },
    loadComponent: () => import('./notes.component').then(m =>
      m.NotesComponent),
  },
];
