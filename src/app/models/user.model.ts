import { Experiencia } from "./experiencia.model"; // Importar el modelo Experiencia

export interface User {
  _id?: string;      // MongoDB genera automáticamente este campo al insertar
  name: string;
  mail: string;     // Añadir el campo email
  password: string;
  comment: string;    // Este campo es la "Biografía"
  experiencies?: Experiencia[]; // Añadir un array de experiencias
}
