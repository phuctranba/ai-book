const pick = function (_object: any, _PickArray: string[]) {
    let ALLOW_VARIABLE: any = {};
    for (let query_string in _object) {
        if (_PickArray.indexOf(query_string) > -1) {
            ALLOW_VARIABLE = {...ALLOW_VARIABLE, ...{[query_string]: _object[query_string]}};
        }
    }
    return ALLOW_VARIABLE;
}

/**
 * Removes fields with an 'id' field that equals ''.
 * This function was created to prevent entities to be sent to
 * the server with an empty id and thus resulting in a 500.
 *
 * @param entity Object to clean.
 */
export function cleanEntity(entity: any) {
    const keysToKeep = Object.keys(entity).filter(k => !(entity[k] instanceof Object) || (entity[k]['id'] !== '' && entity[k]['id'] !== -1));
    return pick(entity, keysToKeep);
};

/**
 * Jamviet.com check if this object is empty
 * @param object
 * @returns
 */
export function isEmptyObject(object: any) {
    try {
        // @ts-ignore
        for (const property in object) {
            return false;
        }
    } catch (e) {
        return false;
    }
    return true;
}

/**
 * ZipEnter parse string json
 * @param value
 */
export function parseJson(value: string | any) {
    try {
        return JSON.parse(value);
    } catch (ex) {
        return undefined;
    }
}

export function sort(attribute: string, reverse: boolean = false) {

    return (a: object, b: object) => {
        if (a[attribute] < b[attribute]) {
            return reverse ? 1 : -1;
        }
        if (a[attribute] > b[attribute]) {
            return reverse ? -1 : 1;
        }
        // a must be equal to b
        return 0;
    }
}
