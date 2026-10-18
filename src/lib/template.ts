// Rellena los marcadores {nombre} de los textos de copy.json con datos de site.json.
// Así el texto es editable sin tocar código y los datos siguen en un solo lugar.
export function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    if (!(key in values)) {
      throw new Error(`Falta el valor de {${key}} en el texto "${template}"`);
    }
    return values[key];
  });
}
