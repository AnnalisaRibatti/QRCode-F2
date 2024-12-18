import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'capitalize'
})
export class CapitalizePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return value; // Restituisci la stringa originale se è vuota o null
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}

/* import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'capitalize'
})
export class CapitalizePipe implements PipeTransform {
  transform(value: string | undefined): string {
    if (!value) return ''; // Restituisci una stringa vuota se è vuota o null
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
} */
