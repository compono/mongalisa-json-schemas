import { expect } from 'chai';
import { Controller, ValidationError, plugin } from '@compono/mongalisa';
import jsonSchemaSupport from '../src';

plugin(jsonSchemaSupport());

class User {
  id: string;

  email?: string;

  password?: string;

  createdAt?: Date;

  static schema = {
    type: 'object',
    properties: {
      email: {
        type: 'string',
        format: 'email'
      },
      password: {
        type: 'string'
      },
      createdAt: {
        type: 'string',
        format: 'date-time'
      }
    },
    required: ['email', 'password']
  };
}

class UsersController<T> extends Controller<T> {
  async validate(data: Partial<User>) {
    const { email } = data as any;

    if (email) {
      const count = await this.where({ email }).count();
      if (count > 0) throw new ValidationError('`email` is already taken');
    }
  }
}

const users = new UsersController<User>(User);

describe('JSON Schema validator plugin', () => {
  before(() => users.init());
  before(() => users.collection.deleteMany({}));

  const randomParams = () => ({
    email: `rando-${Math.random()
      .toString()
      .split('.')
      .pop()}@gmail.com`,
    password: 'Ba(k0/\\/!'
  });

  it('allows us to create valid records', async () => {
    const user = await users.create(randomParams());
    expect(user.id).to.be.a('string');
  });

  it('doesnt let us to save malformed entities', async () => {
    try {
      await users.create({ email: 'hack!' });
      throw new Error('this should have exploded');
    } catch (error) {
      expect(error).to.be.instanceof(ValidationError);
      expect(error.message).to.eql(
        '`email` must be a valid email, `password` this is a required field'
      );
    }
  });

  it('allows to update with valid data', async () => {
    const user = await users.create(randomParams());

    await users.update(user, { email: randomParams().email });
  });

  it('checks update operations', async () => {
    const user = await users.create(randomParams());

    try {
      await users.update(user, { email: 'hack!' });
    } catch (error) {
      expect(error).to.be.instanceof(ValidationError);
      expect(error.message).to.eql('`email` must be a valid email');
    }
  });

  it('allows records to be replaced with new valid data', async () => {
    const user = await users.create(randomParams());
    const newParams = randomParams();

    const newUser = await users.replace(user, newParams);
    expect(newUser.email).to.eql(newParams.email);
  });

  it('validates replace operations', async () => {
    const user = await users.create(randomParams());

    try {
      await users.replace(user, { email: 'hack!' });
      throw new Error('this should have exploded');
    } catch (error) {
      expect(error).to.be.instanceof(ValidationError);
      expect(error.message).to.eql(
        '`email` must be a valid email, `password` this is a required field'
      );
    }
  });

  it('doesnt forget to call the parent validator', async () => {
    const user = await users.create(randomParams());

    try {
      await users.create({ ...randomParams(), email: user.email });
      throw new Error('this should have exploded');
    } catch (error) {
      expect(error).to.be.instanceof(ValidationError);
      expect(error.message).to.eql('`email` is already taken');
    }
  });

  it('validates dates greyt', async () => {
    const now = new Date();
    const user = await users.create({ ...randomParams(), createdAt: now });

    expect(user.createdAt).to.eql(now);
  });
});
