import { Observable } from "rxjs"
import { filter } from "rxjs/operators"
import _ from "lodash"

function inputIsNotEmpty<T>(input: null | undefined | T): input is T {
  return !_.isEmpty(input)
}

export function isNotEmpty<T>() {
  return (source$: Observable<null | undefined | T>) =>
    source$.pipe(filter(inputIsNotEmpty))
}
