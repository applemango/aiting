const _quickSort = (arr, low, high, fn = (a, b) => a <= b) => {
  if (low < high) {
    let pivot = partition(arr, low, high, fn);
    _quickSort(arr, low, pivot - 1, fn);
    _quickSort(arr, pivot + 1, high, fn);
  }
};
function partition(arr, low, high, fn) {
  let pivot = arr[high];
  let i = low - 1;
  for (let j = low; j < high; j++) {
    if (fn(arr[j], pivot)) {
      i++;
      swap(arr, i, j);
    }
  }
  swap(arr, i + 1, high);
  return i + 1;
}
function swap(arr, i, j) {
  let temp = arr[i];
  arr[i] = arr[j];
  arr[j] = temp;
}

/**
 * @template T
 * @param {Array<T>} arr
 * @param {(a: T, b: T)=> boolean} fn
 * @returns
 */
export const quickSort = (arr, fn) => {
  let array = arr.concat();
  _quickSort(array, 0, array.length - 1, fn);
  return array;
};
