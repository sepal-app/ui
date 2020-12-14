import _ from "lodash"

export function toCamelCase<T>(obj: any): T {
  return _.transform<any, T>(
    obj,
    (result: T, value: any, key: string) => {
      if (_.isArray(value)) {
        value = value.map((i) => (_.isObject(i) ? toCamelCase(i) : i))
      } else if (_.isPlainObject(value)) {
        value = toCamelCase(value)
      }
      ;(result as any)[_.camelCase(key)] = value
    },
    {} as T,
  )
}

export function toSnakeCase<T>(obj: any): T {
  return _.transform<any, T>(
    obj,
    (result: T, value: any, key: string) => {
      if (_.isArray(value)) {
        value = value.map((i) => (_.isObject(i) ? toSnakeCase(i) : i))
      } else if (_.isPlainObject(value)) {
        value = toSnakeCase(value)
      }
      ;(result as any)[_.snakeCase(key)] = value
    },
    {} as T,
  )
}
