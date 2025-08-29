//@ts-check

/**
 * @template T
 * @param {Array<T>} arr
 * @param {T} item
 * @param {number} index
 * @returns {Array<T>}
 */
const ArrayInsert = (arr, item, index) => {
    if(index === -1) {
        return [...arr, item]
    }
    return [
        ...arr.slice(0, index),
        item,
        ...arr.slice(index)
    ]
}

/**
 * @template T
 * @param {Array<T>} arr
 * @param {T} item
 * @param {number} index
 */
const ArrayUpdate = (arr, item, index) => {
    return [
        ...arr.slice(0, index),
        item,
        ...arr.slice(index + 1)
    ]
}

/**
 * @template T
 * @param {Array<T>} arr
 * @param {number} index
 */
const ArrayDelete = (arr, index) => {
    return [
        ...arr.slice(0, index),
        ...arr.slice(index + 1)
    ]
}

/**
 * 配列を1次元に変換する関数。 `[1, 2, [3, 4]] => [1, 2, 3, 4]`
 * @template T
 * @param {Array<Array<T>> | Array<T> | any} arr
 * @returns {Array<T>}
 */
const ArrayToFlat = (arr) => {
    return arr.reduce((acc, v) => {
        if (Array.isArray(v)) {
            return [...acc, ...ArrayToFlat(v)]
        }
        return [...acc, v]
    }, [])
}

export {
    ArrayDelete,
    ArrayInsert,
    ArrayUpdate,
    ArrayToFlat
}