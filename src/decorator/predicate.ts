import { Exclude } from 'class-transformer';

import { MetadataStorage } from '../metadata/storage';
import { Constructor } from '../utils/class';

/**
 * A decorator to annotate properties on a DGraph Node class. Only the properties
 * decorated with this decorator will be treated as a node property.
 *
 * @category PublicAPI
 */
export function Predicate(options: Predicate.IOptions): PropertyDecorator {
  return function(target: Object, propertyName: string): void {
    let name = options.name;
    if (!name) {
      name = propertyName;
    }

    // Exclude the predicates to prevent class-transformer from doing unnecessary stuff..
    Exclude()(target, name);

    MetadataStorage.Instance.addPredicateMetadata({
      facet: options.facet,
      count: !!options.count,
      reverse: !!options.reverse,
      type: options.type,
      name,
      target,
      propertyName,
      // TODO:
      isArray: true
    });
  };
}

/**
 * @category PublicAPI
 */
export namespace Predicate {
  /**
   * Options for the `Predicate` decorator.
   */
  export interface IOptions {
    /**
     * Dgraph type of the predicate.
     */
    type: () => Constructor;

    /**
     * Name of the predicate that is created in DGraph. Setting name
     * property lets user to reuse a global predicate between different nodes.
     */
    name?: string;

    /**
     * Facet definition to attach to the connection.
     */
    facet?: Constructor<any>;

    /**
     * Should dgraph count the number of edges out of each node.
     */
    count?: boolean;

    /**
     * Should dgraph computes the reverse edges
     */
    reverse?: boolean;
  }
}

/**
 * Type definition of the predicate.
 *
 * @category PublicAPI
 */
export interface IPredicate<T, U = void> {
  /**
   * Attach a facet to a node connection.
   *
   * ## Note
   * Facet value must be a concrete instance of the facet definition.
   * While it is possible to satisfy to type using a plain object,
   * it breaks the behaviour of the mapper.
   */
  withFacet(facet: U | null): IPredicate<T, U>;

  /**
   * Get an attached facet value of a node.
   */
  getFacet(node: T): U | undefined;

  /**
   * Add a new node to the connection.
   */
  add(node: T): IPredicate<T, U>;

  /**
   * Used for updating a facet on a predicate connection.
   * If the connection does not already exist, use `add` instead.
   *
   * #### Example
   * ```
   * // Add a new facet to existing connection.
   * parent.withFacet(new MyFacet(42)).update(child);
   *
   * // Remove a facet from a connection.
   * parent.withFacet(null).update(child);
   * ```
   */
  update(node: T): IPredicate<T, U>;

  /**
   * Get all nodes on the connection.
   */
  get(): ReadonlyArray<T>;

  /**
   * Remove the node.
   */
  delete(node: T): IPredicate<T, U>;

  /**
   * Remove a list of nodes.
   */
  delete(nodes: T[]): IPredicate<T, U>;

  /**
   * Removes all nodes from the predicate.
   */
  deleteAll(): IPredicate<T, U>;
}
