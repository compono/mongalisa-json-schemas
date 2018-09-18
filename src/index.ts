import Validator, { ValidationError as ValidatarError } from '@shortlyster/validatar';
import { Controller, ValidationError } from '@shortlyster/mongalisa';

export default () => function jsonSchemaValidator<T>(controller: Controller<T>): void {
  const { schema } = controller.Model as any;
  const validator = new Validator(schema);

  const original = controller.validate;

  controller.validate = async function(data: Partial<T>) {
    try {
      validator.validate(data);
    } catch (error) {
      if (error instanceof ValidatarError) {
        throw new ValidationError(error.message);
      }

      throw error;
    }

    await original.call(this, data);
  };
}
