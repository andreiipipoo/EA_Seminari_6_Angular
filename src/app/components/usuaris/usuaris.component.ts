import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';  // Import FormsModule y NgForm para manejar el formulario
import { User } from '../../models/user.model'; // Importar el modelo User desde la subcarpeta services
import { UserService } from '../../services/user.service'; // Importar el servicio UserService desde la subcarpeta services
import { TruncatePipe } from '../../pipes/truncate.pipe';
import { MaskEmailPipe } from '../../pipes/maskEmail.pipe';
import { ExperienciaService} from '../../services/experiencia.service'; // Importar el servicio ExperienciaService
import { Experiencia } from '../../models/experiencia.model'; // Importar el modelo Experiencia

@Component({
  selector: 'app-usuaris',
  templateUrl: './usuaris.component.html',
  styleUrls: ['./usuaris.component.css'],
  standalone: true,  // Esto convierte el componente en independiente
  imports: [CommonModule, FormsModule, TruncatePipe, MaskEmailPipe]  // Importar CommonModule y FormsModule

})
export class UsuarisComponent implements OnInit {
  usuarios: User[] = []; // Lista de usuarios con tipado User
  desplegado: boolean[] = []; // Controla si el desplegable de cada usuario está abierto o cerrado
  desplegarBiografia: boolean[] = []; // Controla si la biografía de cada usuario está desplegada
  mostrarPassword: boolean[] = []; // Controla si la contraseña de cada usuario está visible

  nuevoUsuario: User = {
    name: '',
    mail: '', // Añadir el campo email
    password: '',
    comment: '',
    experiencies: [] // Añadir el campo experiencias
  };

  confirmarPassword: string = ''; // Campo para confirmar la contraseña
  usuarioEdicion: User | null = null; // Usuario en proceso de edición
  indiceEdicion: number | null = null; // Almacena el índice del usuario en edición
  formSubmitted: boolean = false; // Indica si se ha enviado el formulario

  constructor(private userService: UserService, private experienciasService: ExperienciaService) {}

  ngOnInit(): void {
    this.userService.getUsers().subscribe(data => {
      this.usuarios = data;
      this.desplegado = new Array(data.length).fill(false);
      // Obtener las descripciones de las experiencias para cada usuario
      this.usuarios.forEach(usuario => {
        if (usuario.experiencies) {
          usuario.experiencies.forEach((exp, index) => {
            this.experienciasService.getExperienciaById(exp as unknown as string).subscribe((experiencia: Experiencia) => {
              usuario.experiencies![index] = experiencia;  // Reemplazar el ID por el objeto Experiencia completo
            });
          });
        }
      });
    });
  }

  // Función para agregar o modificar un usuario
  agregarElemento(userForm: NgForm): void {
    this.formSubmitted = true;
  
    // Verificar si las contraseñas coinciden
    if (this.nuevoUsuario.password !== this.confirmarPassword) {
      alert('Las contraseñas no coinciden. Por favor, inténtalo de nuevo.');
      return;
    }
  
    if (this.indiceEdicion !== null) {
      // Estamos en modo edición, modificar el usuario existente
      this.usuarios[this.indiceEdicion] = { ...this.nuevoUsuario, _id: this.usuarios[this.indiceEdicion]._id };
  
      // Actualizar el usuario en la API
      this.userService.updateUser(this.usuarios[this.indiceEdicion]).subscribe(response => {
        console.log('Usuario actualizado:', response);
      });
  
      // Limpiar el estado de edición
      this.indiceEdicion = null;
    } else {
      // Modo agregar nuevo usuario
      const usuarioJSON: User = {
        name: this.nuevoUsuario.name,
        mail: this.nuevoUsuario.mail,
        password: this.nuevoUsuario.password,
        comment: this.nuevoUsuario.comment,
        experiencies: this.nuevoUsuario.experiencies
      };
  
      // Enviar el usuario a la API a través del UserService
      this.userService.addUser(usuarioJSON).subscribe(response => {
        console.log('Usuario agregado:', response);
        
        this.usuarios.push({ ...usuarioJSON, _id: response._id, experiencies: response.experiencies });
        this.desplegado.push(false);
      });
    }
  
    // Limpiar los campos del formulario y restablecer su estado
    this.resetForm(userForm);
  }
  

  // Función para limpiar el formulario
  resetForm(userForm: NgForm): void { // Aceptar userForm como parámetro
    this.nuevoUsuario = {
      name: '',
      mail: '', // Limpiar el campo email
      password: '',
      comment: '',
      experiencies: [] // Limpiar el campo experiencias
    };
    this.confirmarPassword = ''; // Reiniciar el campo de confirmar contraseña
    this.formSubmitted = false; // Restablecer el estado del formulario para no mostrar errores
    userForm.resetForm(); // Reiniciar el formulario en la vista
  }

  // Función para preparar la edición de un usuario
  prepararEdicion(usuario: User, index: number): void {
    this.usuarioEdicion = { ...usuario }; // Clonar el usuario para la edición
    this.nuevoUsuario = { ...usuario }; // Cargar los datos del usuario en el formulario
    this.indiceEdicion = index; // Almacenar el índice del usuario en edición
    this.desplegado[index] = true; // Abrir el desplegable del usuario que se está editando
  }

  // Función para eliminar un usuario usando el _id
  eliminarElemento(index: number): void {
    const usuarioAEliminar = this.usuarios[index];
  
    if (!usuarioAEliminar._id) {
      console.error('El usuario no tiene un _id válido. No se puede eliminar.');
      alert('El usuario no se puede eliminar porque no está registrado en la base de datos.');
      return;
    }
  
    if (confirm(`¿Estás seguro de que deseas eliminar a ${usuarioAEliminar.name}?`)) {
      // Eliminar a través del UserService usando el _id como identificador
      this.userService.deleteUserById(usuarioAEliminar._id).subscribe(
        response => {
          console.log('Usuario eliminado:', response);
          this.usuarios.splice(index, 1);
          this.desplegado.splice(index, 1);
        },
        error => {
          console.error('Error al eliminar el usuario:', error);
          alert('Error al eliminar el usuario. Por favor, inténtalo de nuevo.');
        }
      );
    }
  }
  

  // Función para alternar la visualización del desplegable
  toggleDesplegable(index: number): void {
    this.desplegado[index] = !this.desplegado[index];
  }

  
  // Método para alternar entre mostrar más o menos texto
  toggleBiografia(index: number) {
    // Cambia el estado entre desplegado y no desplegado
    this.desplegarBiografia[index] = !this.desplegarBiografia[index];
  }

  // Función para alternar la visibilidad de la contraseña
  togglePassword(index: number): void {
    this.mostrarPassword[index] = !this.mostrarPassword[index]; // Cambiamos entre true y false
  }

}


