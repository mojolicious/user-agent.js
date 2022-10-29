export function expandFormData<T extends {append: any}>(data: any, form: new () => T): T | undefined {
  let formData: T | undefined;

  if (data instanceof form) {
    formData = data;
  } else if (data !== undefined) {
    formData = new form();
    for (const [name, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        formData.append(name, value);
      } else {
        const {content, filename} = value as {content: string | undefined; filename: string | undefined};
        if (content !== undefined) formData.append(name, new Blob([content]), filename);
      }
    }
  }

  return formData;
}
