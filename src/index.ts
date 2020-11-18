import Validator, { ValidationError as ValidatarError } from '@shortlyster/validatar';
import { Controller, ValidationError } from '@shortlyster/mongalisa';

const isPlainObject = (value: any): boolean =>
  typeof value === 'object' && value !== null && value.toString() === '[object Object]';

export const deepConvertDates = (data: any): any => {
  if (Array.isArray(data)) {
    return data.map(deepConvertDates);
  }
  if (isPlainObject(data)) {
    return Object.keys(data).reduce(
      (clone, key) => {
        clone[key] = deepConvertDates(data[key]);
        return clone;
      },
      {} as any
    );
  }
  if (data instanceof Date) {
    return data.toJSON();
  }
  return data;
};

export default () =>
  function jsonSchemaValidator<T>(controller: Controller<T>): void {
    const { schema } = controller.Model as any;

    if (!schema) return;

    const validator = new Validator(schema);

    const original = controller.validate;

    controller.validate = async function(data: Partial<T>) {
      try {
        validator.validate(deepConvertDates(data));
      } catch (error) {
        if (error instanceof ValidatarError) {
          throw new ValidationError(error.message);
        }

        throw error;
      }

      await original.call(this, data);
    };
  };
